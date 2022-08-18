import { Subjects, TicketUpdatedEvent, Publisher } from '@vhtix/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
