import { Listener, OrderCreatedEvent, Subjects } from '@vhtix/common';
import { Message } from 'node-nats-streaming';

import { expirationQueue } from '../../queues/expiration-queue';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;

	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
		console.log('waiting this many ms to process the job: ', delay);
		// this is how we emit a job
		await expirationQueue.add(
			// the 1st param is the payload
			{ orderId: data.id },
			// the 2nd param is options, including delay
			{ delay },
		);

		msg.ack();
	}
}
