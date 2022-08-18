import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { stanWrapper } from '../../stan-wrapper';

describe('DELETE /api/orders/:orderId', () => {
	// test cases already covered in other routes, e.g. 400 or 404,
	// we don't do here to finish the tutorial faster, but we should

	it('marks an order as cancelled', async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		const userCookie = global.signin();
		const { body: order } = await request(app)
			.post('/api/orders')
			.set('Cookie', userCookie)
			.send({
				ticketId: ticket.id,
			})
			.expect(201);

		await request(app)
			.delete(`/api/orders/${order.id}`)
			.set('Cookie', userCookie)
			.send()
			.expect(204);

		const updatedOrder = await Order.findById(order.id);

		expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
	});

	it('emits an order cancelled event', async () => {
		const ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		const userCookie = global.signin();
		const { body: order } = await request(app)
			.post('/api/orders')
			.set('Cookie', userCookie)
			.send({
				ticketId: ticket.id,
			})
			.expect(201);

		await request(app)
			.delete(`/api/orders/${order.id}`)
			.set('Cookie', userCookie)
			.send()
			.expect(204);

		expect(stanWrapper.client.publish).toHaveBeenCalled();
	});
});
