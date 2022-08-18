import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@vhtix/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
	'/api/users/signup',
	// this will end up as an array of middleware that validate email and password
	// and put errors on req object
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 characters'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw new BadRequestError(`email ${email} is already in use`);
		}

		const user = User.build({ email, password });
		await user.save();

		const userJwt = jwt.sign(
			{ id: user.id, email: user.email },
			// Since TS doens't know if process.env.JET_KEY is a string for sure, it complains.
			// We can fix this by adding this right before
			// if (!process.env.JWT_KEY) {throw new Error('JWT_KEY must be defined');}
			// However, it's best to run the check in the index.ts file, which we do.
			// ! at the end of the statement tells TS not to worry.
			process.env.JWT_KEY!,
		);
		// cookie session library will take the sessions object, serialize it into json
		// then encode it into base64 and then send it to the browser in a "Set-Cookie" header.
		// req.session.jwt = userJwt was not working because it said
		// "Object is possibly 'null' or 'undefined'",
		// [probably because session object does not exist on req by default]
		req.session = { jwt: userJwt };

		res.status(201).send(user);
	},
);

export { router as signupRouter };
