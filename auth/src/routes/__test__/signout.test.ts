import request from 'supertest';
import { app } from '../../app';

describe('POST /api/users/signout', () => {
	const email = 'test@test.com';
	const password = 'password';
	beforeEach(async () => {
		await global.signup({ email, password });
	});

	it('clears cookie after signing out', async () => {
		const response = await request(app)
			.post('/api/users/signout')
			.send({})
			.expect(200);

		expect(response.get('Set-Cookie')[0]).toBe(
			'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
		);
	});
});
