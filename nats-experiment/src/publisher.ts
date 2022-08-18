///<reference path="../node_modules/@types/node/index.d.ts"/>
import STAN from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

// the 2nd argument is the client id
// NATS/STAN keeps track of clients connected to it.
const stanClient = STAN.connect('ticketing', 'abc', {
	url: 'http://localhost:4222',
});

stanClient.on('connect', async () => {
	console.log('Publisher connected to NATS');

	const publisher = new TicketCreatedPublisher(stanClient);
	try {
		await publisher.publish({
			id: '123',
			title: 'sfsfsdf',
			price: 10,
		});
	} catch (err) {
		console.log(err);
	}

	// const data = JSON.stringify({
	// 	id: '123',
	// 	title: 'dsfdfs',
	// 	price: 10,
	// });

	// // 'ticket:created' is the subject/channel name we publish to
	// // 'data' has to be stringified.
	// // We can call it an event, but the community calls it a message
	// // The 3rd argument is a callback function that runs after the message is publish.
	// stanClient.publish('ticket:created', data, () => {
	// 	console.log('data published to ticket:created');
	// });
});
