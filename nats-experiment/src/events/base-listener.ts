import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
	subject: Subjects;
	data: any;
}

export abstract class Listener<T extends Event> {
	// name of channel this listener is going to listen on
	abstract subject: T['subject'];
	// name of the queue group this listener will join
	abstract queueGroupName: string;
	// a function to run when messge is received
	abstract onMessage(data: T['data'], msg: Message): void;
	// pre-initialized STAN client
	private client: Stan;
	// number of secs this listener will has to ack a message.
	protected ackWait = 5 * 1000;

	constructor(client: Stan) {
		this.client = client;
	}

	// default subscription options
	subscriptionOptions() {
		return (
			this.client
				.subscriptionOptions()
				.setDeliverAllAvailable()
				.setManualAckMode(true)
				// We are changing the default 30 sec ack wait time
				// i.t.c. to 5 sec
				.setAckWait(this.ackWait)
				// most of the time query group name can also be used as
				// durable subscription name
				.setDurableName(this.queueGroupName)
		);
	}

	// sets up the subscription
	listen() {
		const subscription = this.client.subscribe(
			this.subject,
			this.queueGroupName,
			this.subscriptionOptions(),
		);

		subscription.on('message', (msg, Message) => {
			console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

			const parsedData = this.parseMessage(msg);
			this.onMessage(parsedData, msg);
		});
	}

	// helper function to parse a message
	parseMessage(msg: Message) {
		const data = msg.getData();

		return typeof data === 'string'
			? JSON.parse(data)
			: // We do this in case the data was a buffer,
			  // But that's very unlikely
			  JSON.parse(data.toString('utf8'));
	}
}
