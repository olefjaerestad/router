import {pathToRegexp} from './path-to-regexp';

/**
 * @description Handles SPA routing. Supports express style routing (with params).
 * 
 * @method get - Takes two params: route (string) and callback function. Callback function takes a param `req` containg path and params properties, and must not be arrow function if you want to have `this` be the RouterOutlet inside it.
 * 
 * * @example
 *
 * <router-outlet></router-outlet> // Required for anything to happen.
 * <a href="" router-href="/type/pages">Pages</a> // Navigate to a new route.
 * 
 * @example
 * // Switch out the router outlets' html.
 * RouterOutlet.get('/type/:foo/:bar/hello', function(req) {
 *		const el = document.createElement('p');
 *		el.textContent = `path: ${req.path}, foo: ${req.params.foo}`;
 *		this.innerHTML = ''; // clear the contents of the router outlet
 *		this.appendChild(el); // add new content to the router outlet
 * });
 * 
 * @example 
 * // Async.
 * RouterOutlet.get('/type/:foo/:bar/hello', async function(req) {
 *		const resolvedPromise = await someAsyncFunction();
 *		console.log(resolvedPromise);
 * });
 * 
 * @author
 * Ole Fjaerestad
 */
export class Router {
	/** Private. Current path. */
	private currentRoute = '';
	/** Private. Registered routes. */
	private routes: {[key: string]: (req?: {path: string, params: {[key: string]: string}}) => any} = {};

	constructor() {
		this.addEventListeners();
	}

	/** Private. Add event listeners for popstate and router links `[router-href="/about"]`. */
	private addEventListeners(): void {
		this.handleRouterLinks = e => {
			if (e.type === 'click' || (e.type === 'keyup' && e.key === 'Enter')) {
				const target = e.path[0];
				if ( target && target.closest('[router-href]:not([router-href=""])')) {
					event.preventDefault();
					this.navigate(target.closest('[router-href]:not([router-href=""])').getAttribute('router-href'));
				}
			}
		};
		this.handlePopstate = e => this.runRoute();
		document.addEventListener('click', this.handleRouterLinks);
		document.addEventListener('keyup', this.handleRouterLinks);
		window.addEventListener('popstate', this.handlePopstate);
	}

	/** Register route. */
	get(route: string, callback: (req?: {path: string, params: {[key: string]: string}}) => any): void {
		this.routes[route] = callback;
	}

	/** Delete registered route. */
	delete(route: string): void {
		delete this.routes[route];
	}

	/** Private. Handle changes to browser URL. */
	private handlePopstate: (event: any) => any;

	/** Private. Handle clicks on router links `[router-href="/about"]`. */
	private handleRouterLinks: (event: any) => any;

	/** Navigate to route. */
	navigate (route: string): void {
		window.history.pushState({}, route, window.location.origin + route);
		this.runRoute(route);
	}

	/** Remove event listeners for cleanup purposes. */
	removeEventListeners(): void {
		document.removeEventListener('click', this.handleRouterLinks);
		document.removeEventListener('keyup', this.handleRouterLinks);
		window.removeEventListener('popstate', this.handlePopstate);
	}

	/** Run the callback for a registered path. */
	private runRoute(route?: string): void {
		route = route || window.location.pathname;
		if ( route === this.currentRoute ) {
			return;
		}
		this.currentRoute = route;
		const routeParamValues = route.split('/').slice(1);

		// Try to find matching route.
		const hasMatchingRoute = Object.keys(this.routes).some(registeredRoute => {
			const routeParamKeys: Array<any> = [];
			const regEx = pathToRegexp(registeredRoute, routeParamKeys);

			// Found matching route
      if (route.match(regEx)) {
				// console.log('Router.runRoute', route, registeredRoute);
				// Extract only the route info we need.
				const routeParams = routeParamKeys.map(paramKey => {
					let value: any = routeParamValues[registeredRoute.replace(`(${paramKey.pattern})`, '').split('/').slice(1).indexOf(`:${paramKey.name}`)];
					// Convert to correct type.
					if (!isNaN(value)) {
						value = parseInt(value);
					}
					return {
						key: paramKey.name,
						value,
					}
				});
				// Convert array to object.
				const routeParamsObj = routeParams.reduce((accumulator: {[key: string]: any}, val: {key: string, value: any}) => {
					accumulator[val.key] = val.value;
     			return accumulator;
				}, {});
				// Run corresponding function then return true to break the loop.
				if (registeredRoute && this.routes[registeredRoute]) {
					this.routes[registeredRoute].call(this, {
						route,
						params: routeParamsObj
					});
				}
				return true;
			}

			return false;
		});
		
		if (!hasMatchingRoute && !!this.routes['/404']) {
			this.routes['/404'].call(this, {
				route,
				params: {}
			});
		}
	}

	// connectedCallback() {
	// 	this.runPath();
	// 	this.addEventListeners();
	// }

	// disconnectedCallback() {
	// 	this.removeEventListeners();
	// }
}

/* RouterOutlet.get('/', function(req) {
	// todo: dashboard component
	// const el = document.createElement('single-view');
	// el.setAttribute('items', JSON.stringify(['item1', {key: 'value'}]));
	// this.innerHTML = '';
	// this.appendChild(el);
});
// RouterOutlet.get('/type/:id(\\d+)', function(req) {
// 	console.log('digit');
// 	console.log(req);
// 	return 'single-view';
// 	if (!isNaN(req.params.id)) {
// 		// return new Project(req.params.id).render();
// 		return 'single-view';
// 	}
// });
RouterOutlet.get('/type/:type', async function(req) {
	// await store.actions.getEntries(req.params.type);
	// const el = document.createElement('list-view');
	// el.setAttribute('entries', JSON.stringify(store.state.entries));
	// this.innerHTML = '';
	// this.appendChild(el);
});
RouterOutlet.get('/type/:type/:entry', async function(req) {
	// await store.actions.getEntry(req.params.type, req.params.entry);
	// const el = document.createElement('single-view');
	// el.setAttribute('entry', JSON.stringify(store.state.entry));
	// this.innerHTML = '';
	// this.appendChild(el);
});
// RouterOutlet.get('/type/:foo/:bar', function(req) {
// 	const el = document.createElement('single-view');
// 	el.setAttribute('id', JSON.stringify(req.params.id));
// 	this.appendChild(el);
// });
RouterOutlet.get('/404', function(req) {
	// const el = document.createElement('p');
	// el.textContent = `path "${req.path}" not found`;
	// this.innerHTML = '';
	// this.appendChild(el);
	// console.warn('path %s not found', req.path);
}); */

// window.customElements.define('router-outlet', RouterOutlet);