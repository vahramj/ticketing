import Link from 'next/link';

export default function LandingPage({ currentUser, tickets }) {
	const message = currentUser ? 'You are logged in' : 'You are not logged in';

	const ticketList = tickets.map((ticket) => {
		return (
			<tr key={ticket.id}>
				<td>{ticket.title}</td>
				<td>{ticket.price}</td>
				<td>
					{/* 
					to handle wild card routing, 
					next needs the path to the page passed to the 'href' prop
					and the actual url passed to 'as' prop
					*/}
					<Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
						<a>View</a>
					</Link>
				</td>
			</tr>
		);
	});

	return (
		<div>
			<h1>{message}</h1>
			<table className="table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
					</tr>
				</thead>
				<tbody>{ticketList}</tbody>
			</table>
		</div>
	);
}

LandingPage.getInitialProps = async function _getInitialPropsOfLandingPage(
	context,
	axiosInstace,
	currentUser,
) {
	const { data } = await axiosInstace.get('/api/tickets');

	return { tickets: data };
};
