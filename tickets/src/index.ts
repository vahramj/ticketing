import mongoose from 'mongoose';

import { app } from './app';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { stanWrapper } from './stan-wrapper';

async function start() {
	console.log('starting tickets service .....');
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI must be defined');
	}
	if (!process.env.STAN_CLUSTER_ID) {
		throw new Error('STAN_CLUSTER_ID must be defined');
	}
	if (!process.env.STAN_CLIENT_ID) {
		throw new Error('STAN_CLIENT_ID must be defined');
	}
	if (!process.env.STAN_URL) {
		throw new Error('STAN_URL must be defined');
	}

	try {
		// These env vars are defined in ticketing/infra/k8s/tickets-depl.yaml
		await stanWrapper.connect(
			process.env.STAN_CLUSTER_ID,
			process.env.STAN_CLIENT_ID,
			process.env.STAN_URL,
		);

		// If we embeded this graceful shutdown business inside our StanWrapper class,
		// that would be more convenient, but
		// that class/it's singleton will end up shutting down our entire process.
		// If mongoose did that, we would be pissed.
		// So instead we want to do this in a central location, i.e. index.ts,
		// even if that means we have to repeat this code snippet for every service.
		stanWrapper.client.on('close', () => {
			console.log('NATS connection closed');
			// this will exit tickets service
			process.exit();
		});
		process.on('SIGINT', () => {
			stanWrapper.client.close();
		});
		process.on('SIGTERM', () => {
			stanWrapper.client.close();
		});

		new OrderCreatedListener(stanWrapper.client).listen();
		new OrderCancelledListener(stanWrapper.client).listen();

		await mongoose.connect(process.env.MONGODB_URI);
		console.log('connected to mongo db');
	} catch (err) {
		console.error(err);
	}

	app.listen(3000, () => {
		console.log('app is listening on port 3000!');
	});
}
start();
