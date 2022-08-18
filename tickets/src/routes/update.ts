import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
	NotFoundError,
	NonAuthorizedError,
	errorHandler,
	validateRequest,
	requireAuth,
	BadRequestError,
} from '@vhtix/common';

import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { stanWrapper } from '../stan-wrapper';

const router = express.Router();

router.put(
	'/api/tickets/:id',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and must be greater than 0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);
		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.orderId) {
			throw new BadRequestError('Cannot edit a reserved ticket');
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NonAuthorizedError();
		}

		const { price, title } = req.body;
		ticket.set({ price, title });
		await ticket.save();

		new TicketUpdatedPublisher(stanWrapper.client).publish({
			id: ticket.id,
			price: ticket.price,
			title: ticket.title,
			userId: ticket.userId,
			version: ticket.version,
		});

		res.send(ticket);
	},
);

export { router as updateTicketRouter };
