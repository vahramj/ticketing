import { useCallback, useState } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/useRequest';

export default function Signin() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleRequestSuccess = useCallback(function _handleRequestSuccess() {
		Router.push('/');
	});
	const { makeRequest, errorsElem } = useRequest({
		method: 'post',
		url: '/api/users/signin',
		body: { email, password },
		onSuccess: handleRequestSuccess,
	});
	const handleSubmit = useCallback(
		async function (event) {
			event.preventDefault();
			makeRequest();
		},
		[makeRequest],
	);

	return (
		<form onSubmit={handleSubmit}>
			<h1> Sign In</h1>
			<div className="form-group">
				<label htmlFor="emailField">Email Address</label>
				<input
					className="form-control"
					id="emailField"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div className="form-group">
				<label htmlFor="passwordField">Password</label>
				<input
					type="password"
					className="form-control"
					id="passwordField"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<button className="btn btn-primary">Sign In</button>
			{errorsElem}
		</form>
	);
}
