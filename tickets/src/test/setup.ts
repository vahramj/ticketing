import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

// any file that import the real stan-wrapper, now jest will make them import the mock
// in the __mocks__ folder that has that exact name.
jest.mock('../stan-wrapper');

let mongo: any;
beforeAll(async () => {
	process.env.JWT_KEY = '1234';
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	// resets all mock function and such
	jest.clearAllMocks();
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
	interface signinParams {
		email?: string;
		id?: string;
	}
	var signin: ({}: signinParams) => string[];
}

global.signin = function ({ email = 'test@test.com', id = 'password' }) {
	// Build a jwt payload: {id, email}
	const payload = { id: new mongoose.Types.ObjectId().toHexString(), email };

	// create jwt
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// build session obj
	const session = { jwt: token };
	const sessionJSON = JSON.stringify(session);

	// turn string into base64 string in node
	const base64 = Buffer.from(sessionJSON).toString('base64');

	return [`session=${base64}`];
};
