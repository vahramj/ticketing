import Link from 'next/link';

export default function Header({ currentUser }) {
	const links = [
		!currentUser && { label: 'Sign In', href: '/auth/signin' },
		!currentUser && { label: 'Sign Up', href: '/auth/signup' },
		currentUser && { label: 'Sell Ticket', href: '/tickets/new' },
		currentUser && { label: 'My orders', href: '/orders' },
		currentUser && { label: 'Sign Out', href: '/auth/signout' },
	]
		.filter((linkConfig) => linkConfig)
		.map(({ label, href }) => {
			return (
				<li className="nav-item" key={href}>
					<Link href={href}>
						<a className="nav-link">{label}</a>
					</Link>
				</li>
			);
		});

	return (
		<nav className="navbar navbar-light bg-light">
			{/* in next js we wrap an a tag in a Link component */}
			<Link href="/">
				<a className="navbar-brand">GitTix</a>
			</Link>

			<div className="d-flex justify-content-end">
				<ul className="nav d-flex align-items-center">{links}</ul>
			</div>
		</nav>
	);
}
