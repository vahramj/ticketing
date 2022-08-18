import { useState, useCallback } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/useRequest';

export default function NewTicket() {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');

	const onSuccess = useCallback(
		function _onSuccess() {
			Router.push('/');
		},
		[Router],
	);

	const { makeRequest, errorsElem } = useRequest({
		method: 'post',
		url: '/api/tickets',
		body: {
			title,
			price,
		},
		onSuccess,
	});
	const onSubmit = useCallback(
		function _onSubmit(event) {
			event.preventDefault();

			makeRequest();
		},
		[makeRequest],
	);

	const onBlur = useCallback(
		function _onBlud() {
			const value = parseFloat(price);

			if (isNaN(value)) {
				return;
			}

			setPrice(value.toFixed(2));
		},
		[price, setPrice],
	);

	return (
		<div>
			<h1>Create Ticket</h1>
			<form action="" onSubmit={onSubmit}>
				<div className="from-group">
					<label htmlFor="">Title</label>
					<input
						value={title}
						onChange={(e) => {
							setTitle(e.target.value);
						}}
						className="form-control"
					/>
				</div>
				<div className="from-group">
					<label htmlFor="">Price</label>
					<input
						value={price}
						onBlur={onBlur}
						onChange={(e) => {
							setPrice(e.target.value);
						}}
						className="form-control"
					/>
				</div>
				{errorsElem}
				<button className="btn btn-primary">Submit</button>
			</form>
		</div>
	);
}
