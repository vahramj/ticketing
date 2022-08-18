import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	// readonly makes sure the value cannot change
	readonly subject = Subjects.TicketCreated;
	queueGroupName = 'payment-service';
	// because data param of onMessage methon on Listener has type t['data'],
	// when TicketCreatedEvent is T, data has to be TicketCreatedEvent['data']
	// This will prevent us from passing incorrect types/interfaces as data.
	// [I don't understand why we have to specify type of data here if the base class
	// i.t.c. Listener, mandates it to be T['data'] anyways.]
	onMessage(data: TicketCreatedEvent['data'], msg: Message) {
		console.log('event data: ', data);

		msg.ack();
	}
}
