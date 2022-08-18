import { Listener, OrderCancelledEvent, Subjects } from '@vhtix/common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket) {
			throw new Error('Ticket not found');
		}

		ticket.set('orderId', undefined);
		await ticket.save();

		const { id, version, title, price, orderId, userId } = ticket;
		new TicketUpdatedPublisher(this.client).publish({
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
