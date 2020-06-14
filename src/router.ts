import {pathToRegexp} from './path-to-regexp';

export interface IRouterCallback {
	(req?: {route: string, params: {[key: string]: string|number}}): unknown
}

interface IRouterCallbackObject {
	callback: IRouterCallback,
	middleware: Array<IRouterCallback>,
}

interface IRouterRouteParamKey {
	name: number,
	prefix: null|string,
	delimiter: null|string,
	optional: boolean,
	repeat: boolean,
	pattern: null|string,
}

/**
 * @description Handles SPA routing. Supports express style routing (with params).
 * 
 * @method get - Takes n params: route (string) and n callback functions. All callback functions take a param `req` containg route and params properties, and must not be arrow function if you want to have access to the Router instance as `this` within it.
 * 
 * * @example
 *
 * <a href="" router-href="/type/pages">Pages</a> // Navigate to a new route.
 * 
 * @example
 * // Switch out the router outlets' html.
 * RouterOutlet.get('/type/:foo/:bar/hello', function(req) {
 *		const el = document.createElement('p');
 *		el.textContent = `route: ${req.route}, foo: ${req.params.foo}`;
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
	/** Private. Current route. */
	private currentRoute = '';
	/** Private. Registered routes. */
	private routes: {[key: string]: IRouterCallbackObject} = {};
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
	/** Private. Handle changes to browser URL. */
	private handlePopstate: (event: PopStateEvent) => unknown;
	/** Private. Handle clicks on router links `[router-href="/about"]`. */
	private handleRouterLinks: (event: MouseEvent & KeyboardEvent & {path: Array<HTMLElement>}) => unknown;
	/** Private. Run the callback for a registered route. */
	private runRoute(route?: string): void {
		route = route || window.location.pathname;
		if ( route === this.currentRoute ) {
			return;
		}
		this.currentRoute = route;
		const routeParamValues = route.split('/').slice(1);

		// Try to find matching route.
		const hasMatchingRoute = Object.keys(this.routes).some(registeredRoute => {
			// const routeParamKeys: Array<any> = [];
			const routeParamKeys: Array<IRouterRouteParamKey> = [];
			const regEx = pathToRegexp(registeredRoute, routeParamKeys);

			// Found matching route
      if (route.match(regEx)) {
				// Extract only the route info we need.
				const routeParams: Array<{key: number, value: string|number}> = routeParamKeys.map(paramKey => {
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
				const routeParamsObj: {[key: string]: string|number} = routeParams.reduce((accumulator: {[key: string]: any}, val: {key: number, value: any}) => {
					accumulator[val.key] = val.value;
     			return accumulator;
				}, {});
				// Run corresponding callback then return true to break the loop. TODO: Run middleware before callback.
				if (registeredRoute && this.routes[registeredRoute]) {
					this.routes[registeredRoute].callback({
						route,
						params: routeParamsObj
					});
				}
				return true;
			}

			return false;
		});
		
		if (!hasMatchingRoute && !!this.routes['/404']) {
			this.routes['/404'].callback({
				route,
				params: {}
			});
		}
	}

	/** Create a new router. */
	constructor() {
		this.addEventListeners();
		// this.runRoute(); TODO: Call this here?
	}

	/** Delete registered route. `Router.delete('/home')` */
	delete(route: string): void {
		delete this.routes[route];
	}

	/** Register route. `Router.get('/home', myMiddleware1, myMiddleware2, myCallback)`. Return false in middleware to stop execution. Middleware and callback can be async, and must not be arrow functions if you want to have access to the Router instance as `this` within them. */
	// get(route: string, callback: (req?: {route: string, params: {[key: string]: string}}) => unknown): void {
	// 	this.routes[route] = callback.bind(this);
	// }
	get(route: string, ...middlewareAndCallback: Array<IRouterCallback>): void {
		const callback = middlewareAndCallback[middlewareAndCallback.length-1];
		const middleware = middlewareAndCallback.slice(0, middlewareAndCallback.length-1).map(middleware => middleware.bind(this));
		this.routes[route] = {
			callback: callback.bind(this),
			middleware,
		}
	}

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
}