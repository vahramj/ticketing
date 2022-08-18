import STAN from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

// STAN requires unique id per client,
// so we generate random client id so that we can lauch multiple listeners
// from different terminal windowsusing this node file.
const clientId = randomBytes(4).toString('hex');
const stanClient = STAN.connect('ticketing', clientId, {
	url: 'http://localhost:4222',
});

stanClient.on('connect', () => {
	console.log('Listener connected to NATS');

	// When a stan client connection is closed, this will manually exit the node process.
	stanClient.on('close', () => {
		console.log('NATS connection closed');
		process.exit();
	});

	new TicketCreatedListener(stanClient).listen();
});

// By doing the below, we no longer need to rely on STAN's heartbeat mechanism
// for checking dead connections.
// Which means no events will go to dead subscriptions until STAN figures it's dead.
// This, however, will not cover the cases outside SIGINT and SIGTERM,
// e.g. when we manually kill the process from activity monitor.

// Every time a signal is interrupted, e.g when a client instance is restarted,
// we don't let the process to exit, but manually close stan client connection.
// Which in turn we programmed to manually close the process (see above).
process.on('SIGINT', () => {
	stanClient.close();
});
// Same as above, but terminated signals, e.g. when we do cmd+c
process.on('SIGTERM', () => {
	stanClient.close();
});
