import {
	Listener,
	OrderStatus,
	PaymentCreatedEvent,
	Subjects,
} from '@vhtix/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queueGroupName';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;

	queueGroupName = queueGroupName;

	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId);

		if (!order) {
			throw new Error('Order not found');
		}

		order.set('status', OrderStatus.Complete);
		await order.save();
		// since order gets updated, we ideally should emit an order updated event,
		// but since after the order has 'complete' status,
		// we no longer expect the order to change,
		// we are not going to publish that event to save time in this tutorial.

		msg.ack();
	}
}
