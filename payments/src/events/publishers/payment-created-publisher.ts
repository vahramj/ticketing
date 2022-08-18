import { PaymentCreatedEvent, Publisher, Subjects } from '@vhtix/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
