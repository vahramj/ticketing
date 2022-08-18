import nats, { Stan } from 'node-nats-streaming';

class StanWrapper {
	// the ? tells TS that this value might be undefined for some time.
	private _client?: Stan;

	get client() {
		if (!this._client) {
			throw new Error('Cannont access NATS client before connecting.');
		}
		return this._client;
	}

	connect(clusterId: string, clientId: string, url: string) {
		this._client = nats.connect(clusterId, clientId, { url });

		return new Promise<void>((resolve, reject) => {
			this.client.on('connect', () => {
				console.log('connected to NATS');
				resolve();
			});
			this.client.on('error', (err) => {
				reject(err);
			});
		});
	}
}

export const stanWrapper = new StanWrapper();
