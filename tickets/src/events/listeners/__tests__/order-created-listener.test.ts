import {
	OrderCreatedEvent,
	OrderStatus,
	TicketCreatedEvent,
} from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../../models/ticket';
import { stanWrapper } from '../../../stan-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

describe('tickets service', () => {
	describe('order created listener', () => {
		async function setup() {
			const listener = new OrderCreatedListener(stanWrapper.client);

			const ticket = Ticket.build({
				title: 'concert',
				price: 99,
				userId: '123abc',
			});
			await ticket.save();

			const data: OrderCreatedEvent['data'] = {
				id: new mongoose.Types.ObjectId().toHexString(),
				version: 0,
				status: OrderStatus.Created,
				userId: 'sfsfds',
				expiresAt: 'dfdfdf',
				ticket: {
					id: ticket.id,
					price: ticket.price,
				},
			};

			// @ts-ignore
			const msg: Message = {
				ack: jest.fn(),
			};

			return { listener, data, msg, ticket };
		}

		it('sets the orderId of the ticket', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			const ticket = await Ticket.findById(data.ticket.id);

			expect(ticket!.orderId).toBe(data.id);
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
			expect(ticketUpdatedData.orderId).toBe(data.id);
		});
	});
});
