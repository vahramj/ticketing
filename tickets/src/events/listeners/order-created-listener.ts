import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@vhtix/common';

import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket) {
			throw new Error('Ticket not found');
		}

		ticket.set('orderId', data.id);
		await ticket.save();
		const { id, version, title, price, orderId, userId } = ticket;
		// Every time we receive an order created event and
		// update our ticket with the orderId, we also update the ticket version.
		// To keep other services, e.g. orders, in sync with this db's records,
		// we need to publish a ticket updated event.
		await new TicketUpdatedPublisher(this.client).publish({
			id,
			version,
			title,
			price,
			orderId,
			userId,
		});

		msg.ack();
	}
}
