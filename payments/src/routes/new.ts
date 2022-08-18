import {
	requireAuth,
	BadRequestError,
	NonAuthorizedError,
	validateRequest,
	NotFoundError,
	OrderStatus,
} from '@vhtix/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payments';
import { stanWrapper } from '../stan-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);
		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NonAuthorizedError();
		}
		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for a cancelled order.');
		}

		// the 3 props below are required
		const charge = await stripe.charges.create({
			currency: 'usd',
			// the amount should be non decimal interger, i.e. 120 cents not 1.20 dollars.
			amount: order.price * 100,
			// they mark this as optional, but source is required
			// [why do they mark it optional then?]
			source: token,
		});
		const payment = Payment.build({
			orderId,
			stripeId: charge.id,
		});
		await payment.save();
		await new PaymentCreatedPublisher(stanWrapper.client).publish({
			id: payment.id,
			stripeId: payment.stripeId,
			orderId: payment.orderId,
		});

		res.status(201).send({ id: payment.id });
	},
);

export { router as createChargeRouter };
