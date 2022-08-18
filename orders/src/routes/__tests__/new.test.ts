import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { stanWrapper } from '../../stan-wrapper';

describe('POST /api/orders', () => {
	it('returns an error when ticket does not exist', async () => {
		const ticketId = new mongoose.Types.ObjectId();

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId })
			.expect(404);
	});

	it('returns an error when ticket is already reserved', async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'sdfsfsdf',
			price: 10,
		});
		await ticket.save();

		const order = Order.build({
			userId: 'sfsdfsdf',
			status: OrderStatus.Created,
			expiresAt: new Date(),
			ticket,
		});
		await order.save();

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId: ticket.id })
			.expect(400);
	});

	it('reserves a ticket', async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 10,
		});
		await ticket.save();

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId: ticket.id })
			.expect(201);
	});

	it('emits and order created shot', async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 10,
		});
		await ticket.save();

		await request(app)
			.post('/api/orders')
			.set('Cookie', global.signin())
			.send({ ticketId: ticket.id })
			.expect(201);

		expect(stanWrapper.client.publish).toHaveBeenCalled();
	});
});
