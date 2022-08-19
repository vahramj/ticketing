import mongoose from 'mongoose';

import { app } from './app';
import { stanWrapper } from './stan-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

async function start() {
	console.log('starting the order service ....');
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
		await stanWrapper.connect(
			process.env.STAN_CLUSTER_ID,
			process.env.STAN_CLIENT_ID,
			process.env.STAN_URL,
		);

		stanWrapper.client.on('close', () => {
			console.log('NATS connection closed');
			process.exit();
		});
		process.on('SIGINT', () => {
			stanWrapper.client.close();
		});
		process.on('SIGTERM', () => {
			stanWrapper.client.close();
		});

		new TicketCreatedListener(stanWrapper.client).listen();
		new TicketUpdatedListener(stanWrapper.client).listen();
		new ExpirationCompleteListener(stanWrapper.client).listen();
		new PaymentCreatedListener(stanWrapper.client).listen();

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
