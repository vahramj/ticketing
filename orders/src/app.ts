import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import 'express-async-errors';

import {
	errorHandler,
	NotFoundError,
	putCurrentUserOnReq,
} from '@vhtix/common';

import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/delete';

const app = express();

app.set('trust proxy', true);

app.use(json());

app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	}),
);

app.use(putCurrentUserOnReq);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
