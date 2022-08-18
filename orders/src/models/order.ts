import mongoose from 'mongoose';
import { OrderStatus } from '@vhtix/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { TicketDoc } from './ticket';

interface OrderAttrs {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
	userId: string;
	status: OrderStatus;
	expiresAt: Date;
	// if ticket is a ref, this will be a string(mongoose obj id) until the doc gets populated.
	// Why are we defining it as TicketDoc?
	ticket: TicketDoc;
	version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Created,
		},
		expiresAt: {
			type: mongoose.Schema.Types.Date,
		},
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			// required: true,
			ref: 'Ticket',
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
	return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Orders', orderSchema);

export { Order, OrderStatus };
