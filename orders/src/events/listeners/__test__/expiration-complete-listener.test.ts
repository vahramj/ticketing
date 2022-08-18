import { ExpirationCompleteEvent } from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { stanWrapper } from '../../../stan-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

describe('orders service', () => {
	describe('order compelete listener', () => {
		async function setup() {
			const listener = new ExpirationCompleteListener(stanWrapper.client);

			const ticket = Ticket.build({
				id: new mongoose.Types.ObjectId().toHexString(),
				title: 'concert',
				price: 20,
			});
			await ticket.save();

			const order = Order.build({
				userId: 'sdfsdf',
				status: OrderStatus.Created,
				expiresAt: new Date(),
				ticket,
			});
			await order.save();

			const data: ExpirationCompleteEvent['data'] = {
				orderId: order.id,
			};

			// @ts-ignore
			const msg: Message = {
				ack: jest.fn(),
			};

			return { listener, order, ticket, data, msg };
		}

		it('updates the order status to cancelled', async () => {
			const { listener, order, data, msg } = await setup();

			await listener.onMessage(data, msg);

			const updatedOrder = await Order.findById(order.id);
			expect(updatedOrder!.status).toBe(OrderStatus.Cancelled);
		});

		it('emits an OrderCancelled event', async () => {
			const { listener, order, data, msg } = await setup();

			await listener.onMessage(data, msg);

			expect(stanWrapper.client.publish).toHaveBeenCalled();

			const eventData = JSON.parse(
				(stanWrapper.client.publish as jest.Mock).mock.calls[0][1],
			);

			expect(eventData.id).toBe(order.id);
		});

		it('acks message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			expect(msg.ack).toHaveBeenCalled();
		});
	});
});
