import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

// any file that import the real stan-wrapper, now jest will make them import the mock
// in the __mocks__ folder that has that exact name.
jest.mock('../stan-wrapper');

// We put this here and not in beforeAll,
// because our app needs it while all modules are loading.
// There is a better way to load a secret key into a test env.
// That is by using a config file that holds all the keys and we load it in for test env.
// We never commit the config file to github or make it public.
process.env.STRIPE_KEY =
	'sk_test_51LVkKgBWL8y79o2JmKg873vWFkeJg8A5vcFsJeNjlUgQml0tdnvTNf6cdGPg3smFi1erkGN1ioqT6nKQeNeSdAfv009zr7tN1F';

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
	var signin: (id?: string) => string[];
}
global.signin = function (id?: string, email?: string) {
	// Build a jwt payload: {id, email}
	const payload = {
		id: id || new mongoose.Types.ObjectId().toHexString(),
		email: email || 'test@test.com',
	};

	// create jwt
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// build session obj
	const session = { jwt: token };
	const sessionJSON = JSON.stringify(session);

	// turn string into base64 string in node
	const base64 = Buffer.from(sessionJSON).toString('base64');

	return [`session=${base64}`];
};
