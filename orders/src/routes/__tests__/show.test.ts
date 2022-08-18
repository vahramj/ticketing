import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

describe('GET /api/orders/:orderId', () => {
	it('fetches orders for a particular user', async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		const user = global.signin();

		const { body: order } = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id })
			.expect(201);

		const { body: fetchedOrder } = await request(app)
			.get(`/api/orders/${order.id}`)
			.set('Cookie', user)
			.send()
			.expect(200);

		expect(fetchedOrder).toEqual(order);
	});

	it("returns an error when one user tries to fetch another user's order", async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		const user = global.signin();

		const { body: order } = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id })
			.expect(201);

		await request(app)
			.get(`/api/orders/${order.id}`)
			.set('Cookie', global.signin())
			.send()
			.expect(401);
	});
});
