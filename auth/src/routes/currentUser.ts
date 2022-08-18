import express from 'express';
import { putCurrentUserOnReq } from '@vhtix/common';

const router = express.Router();

// the purpose of this route is for the front end to find out
// who the current user is based on jwt token.
router.get('/api/users/currentUser', putCurrentUserOnReq, (req, res) => {
	res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
