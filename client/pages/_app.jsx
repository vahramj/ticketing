import 'bootstrap/dist/css/bootstrap.css';

import buildAxiosInstance from '../api/buildAxiosInstance';
import Header from '../component/Header';

// next js wraps every page component in a default app wrapper.
// When we create _app.jsx file, we override that default with our own wrapper.
// Unlike regular react apps, next js only parses the route/page it needs to render and deliver.
// This file is the only js(x) file that is guaranteed to be read and parsed for every component.
// If we want global css that applies to every single page/component,
// we have to import it in this file.
// If we want global components, like a nav header, we can add it here too.
function AppComponent({ Component, pageProps, currentUser }) {
	return (
		<div>
			<Header currentUser={currentUser} />
			<div className="container">
				<Component {...pageProps} currentUser={currentUser} />
			</div>
		</div>
	);
}

// .getInitialProps on the wrapper app component and on a page component gets different params.
// on the page it gets context as the param.
// here it gets another object (appContext) which contains the context {ctx, ...}
AppComponent.getInitialProps = async function _getInitialPropsOfLandingPage(
	appContext,
) {
	const { ctx: context, Component } = appContext;

	const axiosInstace = buildAxiosInstance(context);
	const { data } = await axiosInstace.get('/api/users/currentUser');

	// If we put .getInitialProps on this wrapper component,
	// SomePage.getInitialComponent will not be called.
	// To work around that, appContext contains a ref to our underlying component
	// i.t.c. LandingPage.
	// We manually call the child's getInitialProps here, inside the root .getInitialProps
	// and pass the resulting props down to the child.
	let pageProps = {};
	if (Component.getInitialProps) {
		pageProps = await Component.getInitialProps(
			context,
			axiosInstace,
			data.currentUser,
		);
	}

	return { pageProps, ...data };
};

export default AppComponent;
