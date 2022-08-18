import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@vhtix/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queueGroupName';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		// This will make sure we find the ticket record that matches the id and
		// the version of the ticket record the publisher meant to impact.
		// As a result, transactions will happen in the order the publisher emited.
		const ticket = await Ticket.findByEvent(data);

		if (!ticket) {
			throw new Error('Ticket not found');
		}

		const { price, title } = data;
		ticket.set({ price, title });
		await ticket.save();

		msg.ack();
	}
}
