import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

interface TicketAttrs {
	id: string;
	title: string;
	price: number;
}

export interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	version: number;
	isReserved(): Promise<boolean>;
}
interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
	findByEvent(Event: {
		id: string;
		version: number;
	}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			require: true,
		},
		price: {
			type: Number,
			require: true,
			min: 0,
		},
	},
	{
		toJSON: {
			transform(doc, returnValue) {
				returnValue.id = returnValue._id;
				delete returnValue._id;
			},
		},
	},
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	const { id, ...otherAttrs } = attrs;
	return new Ticket({
		_id: id,
		...otherAttrs,
	});
};

// findByIdAndPreviousNumber would have a better, more descriptive name
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
	return Ticket.findOne({
		_id: event.id,
		version: event.version - 1,
	});
};

ticketSchema.methods.isReserved = async function _isReserved() {
	const existingOrder = await Order.findOne({
		ticket: this,
		status: {
			$in: [
				OrderStatus.AwaitingPayment,
				OrderStatus.Complete,
				OrderStatus.Created,
			],
		},
	});

	return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
