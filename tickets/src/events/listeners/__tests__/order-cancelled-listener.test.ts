import {
	OrderCancelledEvent,
	OrderStatus,
	TicketCreatedEvent,
} from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../../models/ticket';
import { stanWrapper } from '../../../stan-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

describe('tickets service', () => {
	describe('order cancelled listener', () => {
		async function setup() {
			const listener = new OrderCancelledListener(stanWrapper.client);

			const ticket = Ticket.build({
				title: 'concert',
				price: 99,
				userId: '123abc',
			});
			await ticket.save();
			const orderId = new mongoose.Types.ObjectId().toHexString();
			ticket.set({ orderId });
			await ticket.save();

			const data: OrderCancelledEvent['data'] = {
				id: new mongoose.Types.ObjectId().toHexString(),
				version: 0,
				ticket: {
					id: ticket.id,
				},
			};

			// @ts-ignore
			const msg: Message = {
				ack: jest.fn(),
			};

			return { listener, data, msg, ticket, orderId };
		}

		it('clears the orderId of the ticket', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			const ticket = await Ticket.findById(data.ticket.id);

			expect(ticket!.orderId).not.toBeDefined();
		});

		it('acks the message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			expect(msg.ack).toHaveBeenCalled();
		});

		it('publishes a ticket updated event', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			expect(stanWrapper.client.publish).toHaveBeenCalled();

			const ticketUpdatedData = JSON.parse(
				(stanWrapper.client.publish as jest.Mock).mock.calls[0][1],
			);
			expect(ticketUpdatedData.orderId).not.toBeDefined();
		});
	});
});
