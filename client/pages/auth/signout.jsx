import { useEffect } from 'react';
import Router from 'next/router';

import useReqest from '../../hooks/useRequest';

export default function SignOut() {
	const { makeRequest } = useReqest({
		method: 'post',
		url: '/api/users/signout',
		body: {},
		onSuccess() {
			Router.push('/');
		},
	});

	useEffect(() => {
		makeRequest();
	}, []);

	return <div>Signing you out...</div>;
}
