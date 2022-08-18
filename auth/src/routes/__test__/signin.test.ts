import request from 'supertest';
import { app } from '../../app';

describe('POST /api/users/signin', () => {
	const email = 'test@test.com';
	const password = 'password';
	beforeEach(async () => {
		await global.signup({ email, password });
	});
	it('fails for an invalid email', async () => {
		await request(app)
			.post('/api/users/signin')
			.send({ email: 'email.com', password })
			.expect(400);
	});

	it('fails for an empty password', async () => {
		await request(app)
			.post('/api/users/signin')
			.send({ email, password: '' })
			.expect(400);
	});

	it('sets cookie for a successful signin', async () => {
		const response = await request(app)
			.post('/api/users/signin')
			.send({ email, password })
			.expect(200);

		expect(response.get('Set-Cookie')).toBeDefined();
	});

	it('fails for a non existing email', async () => {
		await request(app)
			.post('/api/users/signin')
			.send({ email: 'dont@exist.com', password })
			.expect(400);
	});

	it('fails for a wrong password', async () => {
		await request(app)
			.post('/api/users/signin')
			.send({ email, password: 'sfsdfsfsdf' })
			.expect(400);
	});
});
