import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, NonAuthorizedError } from '@vhtix/common';
import { Order } from '../models/order';

const router = express.Router();

router.get(
	'/api/orders/:orderId',
	requireAuth,
	async (req: Request, res: Response) => {
		const order = await Order.findById(req.params.orderId).populate('ticket');

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			// I'd make this into NotFountError as well,
			// since one user doens't need to know that there is an existing
			// order belonging to another user
			// it's a security concern
			throw new NonAuthorizedError();
		}

		res.send(order);
	},
);

export { router as showOrderRouter };
