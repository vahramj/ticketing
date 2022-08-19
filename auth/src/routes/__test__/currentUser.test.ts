import request from 'supertest';
import { app } from '../../app';

describe('GET /api/users/currentUser', () => {
	const email = 'test@test.com';
	const password = 'password';
	let cookie: string[];
	beforeEach(async () => {
		cookie = await global.signup({ email, password });
	});

	it('responds with current user details', async () => {
		const response = await request(app)
			.get('/api/users/currentUser')
			.set('Cookie', cookie)
			.expect(400);
		expect(response.body.currentUser.email).toBe(email);
	});

	it('responds with null if not authenticated', async () => {
		const response = await request(app)
			.get('/api/users/currentUser')
			.expect(200);
		expect(response.body.currentUser).toBe(null);
	});
});
