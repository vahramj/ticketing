import { useCallback, useState } from 'react';
import axios from 'axios';

export default function useRequest({ method, url, body, onSuccess }) {
	const [errorsElem, setErrorsElem] = useState(null);

	const makeRequest = useCallback(
		async function _makeRequest(props = {}) {
			try {
				setErrorsElem(null);
				const response = await axios[method](url, { ...body, ...props });

				onSuccess(response.data);

				return response.data;
			} catch (err) {
				setErrorsElem(
					<div className="alert alert-danger">
						<h4>Ooops...</h4>
						<ul className="my-0">
							{err.response.data.errors.map((error) => (
								<li key={error.message}>{error.message}</li>
							))}
						</ul>
					</div>,
				);
			}
		},
		[method, url, body, setErrorsElem, onSuccess],
	);

	return { makeRequest, errorsElem };
}
