import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@vhtix/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queueGroupName';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
		const { id, price, title } = data;

		// When we replicate data between services, we want to make sure we are using
		// identical/consistent ids between them.
		const ticket = Ticket.build({ id, price, title });
		await ticket.save();

		msg.ack();
	}
}
