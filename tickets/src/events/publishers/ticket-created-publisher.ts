import { Subjects, TicketCreatedEvent, Publisher } from '@vhtix/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
