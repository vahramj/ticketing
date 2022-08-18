import { Ticket } from '../ticket';

describe('Ticket model', () => {
	it('Implements optimistic concurrency control', async () => {
		const ticket = Ticket.build({ price: 5, title: 'concert', userId: '123' });
		await ticket.save();

		// both these instances reference the ticket's version0
		const instance1 = await Ticket.findById(ticket.id);
		const instance2 = await Ticket.findById(ticket.id);

		instance1!.set({ price: 10 });
		instance2!.set({ price: 15 });

		// mongo will make sure record version is incremented.
		await instance1!.save();

		try {
			// mongoose-update-if-current will make sure this instance that
			// references the old version, cannot be saved
			// which would end up overriding the save made by instance1
			await instance2!.save();
		} catch (err) {
			return;
		}

		throw new Error('Should not reach to this point');
	});

	it('increaments the version number on multiple saves', async () => {
		const ticket = Ticket.build({
			title: 'concert',
			price: 5,
			userId: '1234',
		});
		await ticket.save();

		expect(ticket.version).toBe(0);
		await ticket.save();
		expect(ticket.version).toBe(1);
		await ticket.save();
		expect(ticket.version).toBe(2);
	});
});
