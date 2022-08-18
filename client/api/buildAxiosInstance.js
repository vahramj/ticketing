import axios from 'axios';

export default function buildAxiosInstance({ req }) {
	let axiosInstance;
	const isUsedInNodeJS = typeof window === 'undefined';
	if (isUsedInNodeJS) {
		axiosInstance = axios.create({
			baseURL:
				'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers,
		});
	} else {
		axiosInstance = axios.create({
			baseURL: '/',
		});
	}

	return axiosInstance;
}
