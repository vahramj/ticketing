import { TicketCreatedListener } from '../ticket-created-listener';
import { TicketCreatedEvent } from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { stanWrapper } from '../../../stan-wrapper';
import { Ticket } from '../../../models/ticket';

describe('orders service', () => {
	describe('ticket created listener', () => {
		function setup() {
			// create an instance of the listerner
			const listener = new TicketCreatedListener(stanWrapper.client);

			// create a fake data object
			const data: TicketCreatedEvent['data'] = {
				id: new mongoose.Types.ObjectId().toHexString(),
				version: 0,
				title: 'some title',
				price: 10,
				userId: new mongoose.Types.ObjectId().toHexString(),
			};

			// create a fake message object
			// @ts-ignore
			const msg: Message = {
				ack: jest.fn(),
			};

			return { listener, msg, data };
		}

		it('creates and saves a ticket', async () => {
			const { listener, msg, data } = setup();

			// call the onMessge function with the data obj and message obj
			await listener.onMessage(data, msg);

			// write assertions to make sure the ticket was created
			const ticket = await Ticket.findById(data.id);

			expect(ticket).toBeDefined();
			expect(ticket!.title).toBe(data.title);
			expect(ticket!.price).toBe(data.price);
		});

		it('acks the message', async () => {
			const { listener, msg, data } = setup();

			// call the onMessge function with the data obj and message obj
			await listener.onMessage(data, msg);

			// write assertions to make surethe ack function was called
			expect(msg.ack).toHaveBeenCalled();
		});
	});
});
