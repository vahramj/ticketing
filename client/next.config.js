module.exports = {
	webpackDevMiddleware: (config) => {
		// nextJS doesn't update files reliably when running inside a continer.
		// Here we make nextJS webpackDevMiddleware poll files for changes every 300ms
		// instead of it's default checks.
		config.watchOptions.poll = 300;
		return config;
	},
};
