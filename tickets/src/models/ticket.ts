import mongoose from 'mongoose';
// This plugin brings optimistic concurrency control to Mongoose documents by
// 1) incrementing document version numbers on each save, and
// 2) preventing previous versions of a document from being saved over the current version.
// It does that by using find({id, version}) operation.
// If version doesn't match, there will be no record to save over.
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
	title: string;
	price: number;
	userId: string;
}

interface TicketDoc extends mongoose.Document {
	title: string;
	price: number;
	userId: string;
	version: number;
	orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
	build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		orderId: {
			type: String,
		},
	},
	{
		toJSON: {
			transform(doc, returnedObj) {
				returnedObj.id = returnedObj._id;
				delete returnedObj._id;
			},
		},
	},
);

// renames the default "__v" version key to "version"
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
	return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
