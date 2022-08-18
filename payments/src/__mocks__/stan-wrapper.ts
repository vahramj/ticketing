// the name of this file and the exported stanWrapper
// has to match those of the real stan wrapper.
export const stanWrapper = {
	client: {
		// the publish function on the real stanWrapper is the only client prop/method
		// that is being used by files used in out tests
		publish: jest
			.fn()
			// this will give us a testable jest mock,
			// but also implements our exact mock function
			.mockImplementation(
				(subject: string, data: string, callback: () => void) => {
					// We need to call this callback so that the promise returned by
					// the publisher's(e.g. TickerCreatedPublisher) .publish() function gets resolved
					// see ticketing/common/src/events/base-publisher.ts
					// for how client.publish is being used
					callback();
				},
			),
	},
	// connect function is not being envoked by our tests => no need to mock it
};
