import { OrderStatus } from '@vhtix/common';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payments';

// jest.mock('../../stripe');

describe('POST /api/payments', () => {
	it('return 404 when purchasing an order that does not exist', async () => {
		await request(app)
			.post('/api/payments')
			.set('Cookie', global.signin())
			.send({
				token: 'sfsdfsd',
				orderId: new mongoose.Types.ObjectId().toHexString(),
			})
			.expect(404);
	});

	it("returns 401 when purchasing another user's order", async () => {
		const order = await Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			version: 0,
			userId: new mongoose.Types.ObjectId().toHexString(),
			price: 100,
			status: OrderStatus.Created,
		});
		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', global.signin())
			.send({
				token: 'sfsdfsd',
				orderId: order.id,
			})
			.expect(401);
	});

	it('returns 400 when purchasing a cancelled order ', async () => {
		const userId = new mongoose.Types.ObjectId().toHexString();

		const order = await Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			version: 0,
			userId,
			price: 100,
			status: OrderStatus.Cancelled,
		});
		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', global.signin(userId))
			.send({
				token: 'sfsdfsd',
				orderId: order.id,
			})
			.expect(400);
	});

	it('returns 201 with valid inputs', async () => {
		const userId = new mongoose.Types.ObjectId().toHexString();

		// we are using this large random price, so that we can use it to id the charge.
		const price = Math.floor(Math.random() * 100000);
		const order = await Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			version: 0,
			userId,
			price,
			status: OrderStatus.Created,
		});
		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', global.signin(userId))
			.send({
				token: 'tok_visa',
				orderId: order.id,
			})
			.expect(201);

		// const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

		// expect(chargeOptions).toEqual({
		// 	currency: 'usd',
		// 	amount: 20 * 100,
		// 	source: 'tok_visa',
		// });

		// this will fetch last 50 charges we created on stripe. The default is 10;
		const stripeCharges = await stripe.charges.list({
			// In case we run say 10 copies of this test suit,
			// we might have issues with the default 10. 50 sounds like a save number.
			limit: 50,
		});
		const stripeCharge = stripeCharges.data.find((charge) => {
			return charge.amount === price * 100;
		});

		expect(stripeCharge).toBeDefined();
		expect(stripeCharge!.currency).toBe('usd');

		const payment = await Payment.findOne({
			orderId: order.id,
			stripeId: stripeCharge!.id,
		});

		expect(payment).not.toBeNull();
	});
});
