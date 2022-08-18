import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { stanWrapper } from '../../stan-wrapper';

describe('POST /api/tickets', () => {
	it('has a route handler listening', async () => {
		const response = await request(app).post('/api/tickets').send({});
		expect(response.status).not.toEqual(404);
	});

	it('can only be accessed if the user is signed in', async () => {
		await request(app).post('/api/tickets').send({}).expect(401);
	});

	it('returns the status of other than 401 when the user is signed in', async () => {
		const response = await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({});

		expect(response.status).not.toEqual(401);
	});

	it('returns an error if invalid title is provided', async () => {
		await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({ title: '', price: 10 })
			.expect(400);

		await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({ price: 10 })
			.expect(400);
	});

	it('returns an error if invalid price is provided', async () => {
		await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({
				title: 'dsfdsfs',
				price: -10,
			})
			.expect(400);

		await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({
				title: 'dsfdsfs',
			})
			.expect(400);
	});

	it('creates a ticket with valid inputs', async () => {
		let tickets = await Ticket.find({});
		expect(tickets.length).toEqual(0);

		const title = 'dfsdfs';
		const price = 10;

		await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({ title, price })
			.expect(201);

		tickets = await Ticket.find({});
		expect(tickets.length).toBe(1);
		expect(tickets[0].title).toBe(title);
		expect(tickets[0].price).toBe(price);
	});

	it('publishes an event', async () => {
		const title = 'dfsdfs';
		const price = 10;

		await request(app)
			.post('/api/tickets')
			.set('Cookie', global.signin({}))
			.send({ title, price })
			.expect(201);

		expect(stanWrapper.client.publish).toHaveBeenCalled();
	});
});
