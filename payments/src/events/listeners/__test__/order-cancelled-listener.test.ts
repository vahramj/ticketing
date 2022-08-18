import { OrderCancelledEvent, OrderStatus } from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { stanWrapper } from '../../../stan-wrapper';
import { OrderCancelledListener } from '../OrderCancelledListener';

async function setup() {
	const listener = new OrderCancelledListener(stanWrapper.client);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: 'sdfasfd',
		price: 10,
		status: OrderStatus.Created,
	});
	await order.save();

	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 1,
		ticket: {
			id: 'sfsfsdf',
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, order, data, msg };
}

describe('payments service', () => {
	describe('order cancelled listener', () => {
		it('updates the status of the order to cancelled', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			const order = await Order.findById(data.id);

			expect(order!.status).toBe(OrderStatus.Cancelled);
		});

		it('acks the message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			expect(msg.ack).toHaveBeenCalled();
		});
	});
});
