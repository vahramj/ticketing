import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { stanWrapper } from '../../stan-wrapper';
import { Ticket } from '../../models/ticket';

describe('PUT /api/tickets/:id', () => {
	it('return 404 if the provided id does not exists', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();

		await request(app)
			.put(`/api/tickets/${id}`)
			.set('Cookie', global.signin({}))
			.send({ title: 'sdfbkkm', price: 10 })
			.expect(404);
	});

	it('return 401 if the user is not authenticated', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();
		await request(app)
			.put(`/api/tickets/${id}`)
			.send({ title: 'sdfbkkm', price: 10 })
			.expect(401);
	});

	it('return 401 if the user does not own the ticket', async () => {
		const title = 'sdfsdfdsf';
		const price = 20;
		const createTicketResponse = await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({ title, price });

		await request(app)
			.put(`/api/tickets/${createTicketResponse.body.id}`)
			.set('Cookie', global.signin({}))
			.send({ title: 'sss', price: 1000 })
			.expect(401);

		const ticketResponse = await request(app)
			.get(`/api/tickets/${createTicketResponse.body.id}`)
			.send();
		expect(ticketResponse.body.title).toBe(title);
		expect(ticketResponse.body.price).toBe(price);
	});

	it('return 400 if the user provides invalid title or price', async () => {
		const cookie = global.signin({});

		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ title: 'dfdfd', price: 20 });

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({ title: '', price: 20 })
			.expect(400);

		await request(app)
			.put(`/api/tickets/${response.body.id}`)
			.set('Cookie', cookie)
			.send({ title: 'dfgdfg', price: -20 })
			.expect(400);
	});

	it('updates the ticket provided valid inputs', async () => {
		const cookie = global.signin({});

		const title = 'new title';
		const price = 200;

		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ title: 'sdfsfsdf', price: 20 });

		await request(app)
			.put(`/api/tickets/${createResponse.body.id}`)
			.set('Cookie', cookie)
			.send({ title, price })
			.expect(200);

		const getResponse = await request(app)
			.get(`/api/tickets/${createResponse.body.id}`)
			.send()
			.expect(200);

		expect(getResponse.body.title).toBe(title);
		expect(getResponse.body.price).toBe(price);
	});

	it('publishes event', async () => {
		const cookie = global.signin({});

		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ title: 'sdfsfsdf', price: 20 });

		await request(app)
			.put(`/api/tickets/${createResponse.body.id}`)
			.set('Cookie', cookie)
			.send({ title: 'new title', price: 200 })
			.expect(200);

		expect(stanWrapper.client.publish).toHaveBeenCalled();
	});

	it('rejects updates if the ticket is reserved', async () => {
		const cookie = global.signin({});

		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ title: 'sdfsfsdf', price: 20 });

		const ticket = await Ticket.findById(createResponse.body.id);
		ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
		await ticket!.save();

		await request(app)
			.put(`/api/tickets/${createResponse.body.id}`)
			.set('Cookie', cookie)
			.send({ title: 'new title', price: 200 })
			.expect(400);
	});
});
