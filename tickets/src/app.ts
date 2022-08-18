import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
// this module automatically passes errors thrown in an async route
// to the error handling middeware, e.g. see app.all("*") route below.
import 'express-async-errors';

import {
	errorHandler,
	NotFoundError,
	putCurrentUserOnReq,
} from '@vhtix/common';

import { createTicketRouter } from './routes/new';
import { showTicketsRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

const app = express();
// this express server is behind a proxy nginx server that forwards requests here.
// Among other things, the proxy server adds X-Forwarded-Proto header which indicates
// weather the protocol it used is http, https, or some wrong name even.
// This ties into secure cookie session set below.
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		// signed indicates if the cookie is encrypted, i.d.c. we don't encrypt it
		signed: false,
		// secure makes sure cookies are sent only when the connection is https
		// we want to set the cookie for http reqs when testing,
		// so that we don't have to make https requests.
		// [This seems like a cheat to me.]
		secure: process.env.NODE_ENV !== 'test',
	}),
);

app.use(putCurrentUserOnReq);

app.use(createTicketRouter);
app.use(showTicketsRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
