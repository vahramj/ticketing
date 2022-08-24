import axios from 'axios';

export default function buildAxiosInstance({ req }) {
	let axiosInstance;
	const isUsedInNodeJS = typeof window === 'undefined';
	if (isUsedInNodeJS) {
		axiosInstance = axios.create({
			// lalalala
			baseURL:
				// 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
				// [Weren't these requests sent to nginx from our cluster internally,
				// like above?
				// Why do we need to send them to an external address?]
				// [Also, shouldn't this depend on the env, prod or dev?]
				'http://www.jeenj.com',
			headers: req.headers,
		});
	} else {
		axiosInstance = axios.create({
			baseURL: '/',
		});
	}

	return axiosInstance;
}
