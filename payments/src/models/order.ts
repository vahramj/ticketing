import { OrderStatus } from '@vhtix/common';
import mongoose from 'mongoose';

import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttr {
	// when we create an order for payments service
	// it is referencing the order in orders service => id is necessary
	id: string;
	version: number;
	userId: string;
	price: number;
	status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
	// OrderDoc doens't need an added value of id,
	// because mongoose.Document we extend alrady comes with id.
	version: number;
	userId: string;
	price: number;
	status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
	build(attr: OrderAttr): OrderDoc;
}

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			require: true,
		},
		price: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(OrderStatus),
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

orderSchema.statics.build = (attrs: OrderAttr) => {
	const { id, ...otherAttrs } = attrs;
	return new Order({
		_id: id,
		...otherAttrs,
	});
};

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
