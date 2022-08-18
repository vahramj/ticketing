import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
	// this destroys the session
	req.session = null;

	res.send({});
});

export { router as signoutRouter };
