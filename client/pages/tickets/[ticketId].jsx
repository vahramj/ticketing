import Router from 'next/router';

import useRequest from '../../hooks/useRequest';

function TicketShow({ ticket }) {
	const { makeRequest, errorsElem } = useRequest({
		method: 'post',
		url: '/api/orders',
		body: {
			ticketId: ticket.id,
		},
		onSuccess(order) {
			// this is similar to how we use the Link component
			// the 1st param is the 'href', i.e. where the orders page is,
			// the 2nd param is 'as', i.e.the actual url
			Router.push('/orders/[orderId]', `/orders/${order.id}`);
		},
	});

	return (
		<div>
			<h1>{ticket.title}</h1>
			<h4>Price: {ticket.price}</h4>
			{errorsElem}
			<button
				className="btn btn-primary"
				onClick={() => {
					makeRequest();
				}}
			>
				Purchase
			</button>
		</div>
	);
}

TicketShow.getInitialProps = async function _getTicketsInitialProps(
	context,
	axiosInstance,
) {
	// the query.ticketId comes from [ticketId].jsx file naming pattern
	const { ticketId } = context.query;

	const { data } = await axiosInstance.get(`/api/tickets/${ticketId}`);

	return { ticket: data };
};

export default TicketShow;
