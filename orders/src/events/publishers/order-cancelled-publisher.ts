import { Publisher, OrderCancelledEvent, Subjects } from '@vhtix/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
