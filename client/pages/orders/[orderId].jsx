import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

import useRequest from '../../hooks/useRequest';

function OrderShow({ order, currentUser }) {
	const [timeLeft, setTimeLeft] = useState(0);
	useEffect(function _setTimer() {
		function processTimeLeft() {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		}

		processTimeLeft();
		const intervalId = setInterval(processTimeLeft, 1000);

		return function _cleanupSetTimer() {
			clearInterval(intervalId);
		};
	}, []);

	const { makeRequest, errorsElem } = useRequest({
		method: 'post',
		url: '/api/payments',
		body: { orderId: order.id },
		onSuccess() {
			Router.push('/orders');
		},
	});

	if (timeLeft < 0) {
		return <div>Order expired</div>;
	}
	return (
		<div>
			Time left to pay: {timeLeft} seconds
			<StripeCheckout
				token={({ id }) => {
					makeRequest({ token: id });
				}}
				// even though this is a public key, we should not hardcode it in like this
				// we should have it in some config file which puts it on env vars
				stripeKey="pk_test_51LVkKgBWL8y79o2J3AGDnCtkLgTaqCwUEia5kfw30R5cbeS6T5MERLTQ35v4ILyTtIR7kmeloXCPBYmThVoPX7GJ00PxGKdyQ4"
				// everything in stripe world is done with cents => need * 100
				amount={order.ticket.price * 100}
				email={currentUser.email}
			/>
			{errorsElem}
		</div>
	);
}

OrderShow.getInitialProps = async function _getOrderShowInitialProps(
	context,
	axiosInstace,
) {
	const { orderId } = context.query;

	const { data } = await axiosInstace.get(`/api/orders/${orderId}`);

	return { order: data };
};

export default OrderShow;
