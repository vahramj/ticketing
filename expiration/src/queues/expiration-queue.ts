import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publisher/expiration-complete-publisher';
import { stanWrapper } from '../stan-wrapper';

interface Payload {
	orderId: string;
}

// The Payload interface/type will inform what job.data object is like.
// The first param is the queue name, i.t.c. order:expiration
const expirationQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST,
	},
});

// This specifies how we process a job when we receive it.
// i.e. this is a listener on the queue
expirationQueue.process(async (job) => {
	new ExpirationCompletePublisher(stanWrapper.client).publish({
		orderId: job.data.orderId,
	});
});

export { expirationQueue };
