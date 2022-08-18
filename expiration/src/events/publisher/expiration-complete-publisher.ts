import { ExpirationCompleteEvent, Publisher, Subjects } from '@vhtix/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
