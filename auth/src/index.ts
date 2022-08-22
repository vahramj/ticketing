import mongoose from 'mongoose';

import { app } from './app';

async function start() {
	console.log('starting up auth service ...........');
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI must be defined');
	}

	try {
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
