import request from 'supertest';
import { app } from '../../app';

describe('POST /api/users/signup', () => {
	it('returns 201 on successful signup', async () => {
		// We need to return or await the promise this chain produces.
		// Otherwise this test will always pass.
		return request(app)
			.post('/api/users/signup')
			.send({ email: 'test@test.com', password: '123xyz' })
			.expect(201);
	});

	it('returns 400 with an invalid email', async () => {
		return request(app)
			.post('/api/users/signup')
			.send({ email: '123123dfsfsdf', password: '123xyz' })
			.expect(400);
	});

	it('returns 400 with an invalid password', async () => {
		return request(app)
			.post('/api/users/signup')
			.send({ email: 'test@test.com', password: '1' })
			.expect(400);
	});

	it('returns 400 with a missing email or password', async () => {
		await request(app)
			.post('/api/users/signup')
			.send({ email: 'test@test.com' })
			.expect(400);

		await request(app)
			.post('/api/users/signup')
			.send({ password: '123xyz' })
			.expect(400);
	});

	it('disallows duplicate emails', async () => {
		await request(app)
			.post('/api/users/signup')
			.send({
				email: 'test@test.com',
				password: '123xyz',
			})
			.expect(201);

		await request(app)
			.post('/api/users/signup')
			.send({
				email: 'test@test.com',
				password: '123xyz',
			})
			.expect(400);
	});

	it('sets a cookie after a successful signup', async () => {
		const cookie = await global.signup({
			email: 'test@test.com',
			password: '123xyz',
		});

		expect(cookie).toBeDefined();
	});
});
