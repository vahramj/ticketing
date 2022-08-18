import { NonAuthorizedError, NotFoundError, requireAuth } from '@vhtix/common';
import express, { Request, Response } from 'express';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

import { Order, OrderStatus } from '../models/order';
import { stanWrapper } from '../stan-wrapper';

const router = express.Router();

// patch would be more appropriate here than delete
router.delete(
	'/api/orders/:orderId',
	requireAuth,
	async (req: Request, res: Response) => {
		const { orderId } = req.params;

		const order = await Order.findById(orderId).populate('ticket');

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NonAuthorizedError();
		}
		order.status = OrderStatus.Cancelled;
		await order.save();

		new OrderCancelledPublisher(stanWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});
		res.status(204).send(order);
	},
);

export { router as deleteOrderRouter };
