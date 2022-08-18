import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = '1234';
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	// resetting our data between each test we run
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

const teardownTimeout = 40 * 1000;
afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
}, teardownTimeout);

declare global {
	interface signupParams {
		email?: string;
		password?: string;
	}
	var signup: ({}: signupParams) => Promise<string[]>;
}

global.signup = async function ({
	email = 'test@test.com',
	password = 'password',
}) {
	const response = await request(app)
		.post('/api/users/signup')
		.send({ email, password })
		.expect(201);

	const cookie = response.get('Set-Cookie');
	return cookie;
};
