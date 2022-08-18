import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

async function buildTicket() {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	return ticket;
}
describe('GET /api/orders', () => {
	it('fetches orders for a particular user', async () => {
		// create 3 tickets
		const ticket1 = await buildTicket();
		const ticket2 = await buildTicket();
		const ticket3 = await buildTicket();

		const user1 = global.signin();
		const user2 = global.signin();
		// create 1 order for user1
		await request(app)
			.post('/api/orders')
			.set('Cookie', user1)
			.send({ ticketId: ticket1.id })
			.expect(201);

		// create 2 order for user2
		const { body: order2 } = await request(app)
			.post('/api/orders')
			.set('Cookie', user2)
			.send({ ticketId: ticket2.id })
			.expect(201);

		const { body: order3 } = await request(app)
			.post('/api/orders')
			.set('Cookie', user2)
			.send({ ticketId: ticket3.id })
			.expect(201);

		// fetch orders for user2
		const response = await request(app)
			.get('/api/orders')
			.set('Cookie', user2)
			.expect(200);

		// make use we only got the order for user 2
		expect(response.body.length).toBe(2);
		expect(response.body[0]).toEqual(order2);
		expect(response.body[1]).toEqual(order3);
	});
});
