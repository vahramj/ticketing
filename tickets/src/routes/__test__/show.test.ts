import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

describe('GET /api/tickets/:id', () => {
	it('returns 404 if the ticket is not found', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();
		await request(app).get(`/api/tickets/${id}`).send().expect(404);
	});

	it('returns the ticket if ticket is found', async () => {
		const title = 'sdfsdf';
		const price = 20;
		const postResponse = await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({ title, price })
			.expect(201);

		const getResponse = await request(app)
			.get(`/api/tickets/${postResponse.body.id}`)
			.send()
			.expect(200);

		expect(getResponse.body.title).toEqual(title);
		expect(getResponse.body.price).toEqual(price);
	});
});
