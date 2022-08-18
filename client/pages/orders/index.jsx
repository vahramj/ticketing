function OrderIndex({ orders }) {
	return (
		<ul>
			{orders.map((order) => {
				return (
					<li key={order.id}>
						{order.ticket.title} - {order.status}
					</li>
				);
			})}
		</ul>
	);
}

OrderIndex.getInitialProps = async function _getOrderIndexInitialProps(
	context,
	axiosInstance,
) {
	const { data } = await axiosInstance.get('/api/orders');

	return { orders: data };
};

export default OrderIndex;
