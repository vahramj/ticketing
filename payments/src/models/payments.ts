import mongoose from 'mongoose';

interface PaymentAttrs {
	orderId: string;
	stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
	orderId: string;
	stripeId: string;
	// we don't include version here because a payment doc will be created only once.
	// and will never change => no need to track versions for proper sequential updates.
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
	build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			required: true,
		},
		stripeId: {
			type: String,
			required: true,
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

paymentSchema.statics.build = (attr: PaymentAttrs) => {
	const { stripeId, orderId } = attr;

	return new Payment({ stripeId, orderId });
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
	'Payment',
	paymentSchema,
);

export { Payment };
