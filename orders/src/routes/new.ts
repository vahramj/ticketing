import express, { Request, Response } from 'express';
import {
	validateRequest,
	requireAuth,
	NotFoundError,
	BadRequestError,
	OrderStatus,
} from '@vhtix/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { stanWrapper } from '../stan-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => {
				return mongoose.Types.ObjectId.isValid(input);
			})
			.withMessage('Valid ticketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;

		// Find the ticket the user is trying to order
		const ticket = await Ticket.findById(ticketId);
		if (!ticket) {
			throw new NotFoundError();
		}

		// Make sure that this ticket is not already reserved
		const isReserved = await ticket.isReserved();
		if (isReserved) {
			throw new BadRequestError('Ticket is not available');
		}

		// Calculate an expiration date for this order
		const expirationDate = new Date();
		expirationDate.setSeconds(
			expirationDate.getSeconds() + EXPIRATION_WINDOW_SECONDS,
		);

		// Build the order and save it to db
		const newOrder = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expirationDate,
			ticket,
		});
		await newOrder.save();

		// Publish an event saying that the order was created
		new OrderCreatedPublisher(stanWrapper.client).publish({
			id: newOrder.id,
			status: newOrder.status,
			// This will convert the date object to UTF date string
			// Otherwise toJSON on the Date object will convert it
			// to the timezone stirng of the local timezone
			expiresAt: newOrder.expiresAt.toISOString(),
			userId: newOrder.userId,
			version: newOrder.version,
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		});

		res.status(201).send(newOrder);
	},
);

export { router as newOrderRouter };
