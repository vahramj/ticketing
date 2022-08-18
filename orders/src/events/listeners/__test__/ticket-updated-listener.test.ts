import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Listener, TicketUpdatedEvent } from '@vhtix/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { stanWrapper } from '../../../stan-wrapper';
import { Ticket } from '../../../models/ticket';

describe('orders service', () => {
	describe('ticket updated listener', () => {
		async function setup() {
			// create an instance of the listerner
			const listener = new TicketUpdatedListener(stanWrapper.client);

			// create a ticket
			const ticket = Ticket.build({
				title: 'some title',
				price: 10,
				id: new mongoose.Types.ObjectId().toHexString(),
			});
			await ticket.save();

			// create a fake data object
			const data: TicketUpdatedEvent['data'] = {
				id: ticket.id,
				version: ticket.version + 1,
				title: 'some title2',
				price: 100,
				userId: new mongoose.Types.ObjectId().toHexString(),
			};

			// create a fake message object
			// @ts-ignore
			const msg: Message = {
				ack: jest.fn(),
			};

			return { listener, msg, data, ticket };
		}

		it('finds, update, and saves a ticket', async () => {
			const { listener, msg, data } = await setup();

			// call the onMessge function with the data obj and message obj
			await listener.onMessage(data, msg);

			// write assertions to make sure the ticket was created
			const ticket = await Ticket.findById(data.id);

			expect(ticket).toBeDefined();
			expect(ticket!.title).toBe(data.title);
			expect(ticket!.price).toBe(data.price);
			expect(ticket!.version).toBe(data.version);
		});

		it('acks the message', async () => {
			const { listener, msg, data } = await setup();

			// call the onMessge function with the data obj and message obj
			await listener.onMessage(data, msg);

			// write assertions to make surethe ack function was called
			expect(msg.ack).toHaveBeenCalled();
		});

		it('does not call ack if the event has a skipped version number', async () => {
			const { listener, msg, data } = await setup();

			data.version = 10;

			try {
				await listener.onMessage(data, msg);
			} catch (err) {}

			expect(msg.ack).not.toHaveBeenCalled();
		});
	});
});
