import { OrderCreatedEvent, OrderStatus } from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { stanWrapper } from '../../../stan-wrapper';
import { OrderCreatedListener } from '../OrderCreatedListener';

async function setup() {
	const listener = new OrderCreatedListener(stanWrapper.client);

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'nkkfll',
		expiresAt: 'sfsfdsd',
		ticket: {
			id: 'dfdfd',
			price: 100,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
}

describe('payments service', () => {
	describe('order created listener', () => {
		it('replicates the order info', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			const order = await Order.findById(data.id);

			expect(order!.price).toBe(data.ticket.price);
		});

		it('acks the message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			expect(msg.ack).toHaveBeenCalled();
		});
	});
});
