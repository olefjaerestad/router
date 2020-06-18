# Router
Lightweight client side JavaScript router to run certain code at certain URL routes.

## Installation
```bash
npm i @olefjaerestad/router
```

## API/examples
TODO:

### Create a router
```javascript
import { Router } from '@olefjaerestad/router';

const router = new Router();
```

### Run callback function at specific route
```javascript
/* Log req when route is '/home'. */
router.get('/home', (req) => console.log(req));

/* Within non-arrow callbacks, this = the Router instance. */
router.get('/about', function(req) {
	console.log(this);
});
```

> Note: A route can only be registered once. Trying to register the same route again will overwrite the previous registration.

### Fallback route
You might want some code to run when no routes are matched. You can do this by adding a '/404' route.

```javascript
/* This route will trigger when no routes are matched. */
router.get('/404', (req) => console.log(req));
```

> Note: This route will trigger both if no routes are matched or if the current route is '/404'.

### Route params
Routes don't have to be static. Just like in Express, you can use route parameters. For all possible syntaxes, see [Route parameters in Express](https://expressjs.com/tr/guide/routing.html#route-parameters).

```javascript
router.get('/blog/:slug/:id/:test', (req) => {
	console.log(req.params.slug);
	console.log(req.params.id);
	console.log(req.params.test);
});
```

Given the code above and a route of `/blog/my-post/123/hello`, the following will be logged:

```
my-post
123
hello
```

### Delete route
```javascript
/* Stop running callback function at specific route */
router.delete('/home');
```

### Middleware
In addition to a callback function, Router.get() also supports middleware. Much like [Express middleware](https://expressjs.com/en/guide/using-middleware.html), middleware are basically additional callback functions that can alter the `req` object or stop the execution of further route middleware and the route callback.

Alter the `req` object:
```javascript
const reqMiddleware = (req) => myFunc() ? req.foo = 'bar' ? null;

/* req.foo will be 'bar' or undefined, depending on the result of myFunc(). */
router.get('/home', reqMiddleware, (req) => console.log(req.foo));
```

Stop the execution of further route middleware and the route callback:
```javascript
const authMiddleware = (req) => isLoggedIn();

/* If authMiddleware() === false, req won't be logged even if route is '/home'. */
router.get('/home', authMiddleware, (req) => console.log(req));
```

> Note: middleware will be ran in the order they are passed to `Router.get()`, from left to right.

### Async middleware and callbacks
Middleware and callbacks can also be async, which could be useful when doing things like network requests, authentication, etc.

```javascript
const authMiddleware = async (req) => await isLoggedIn();

/* If authMiddleware() === false, callback won't run even if route is '/home'. */
router.get('/home', authMiddleware, async (req) => {
	const result = await getPromise();
	console.log(result);
});
```

> Note: Async middleware will resolve (be completed) before the next middleware/callback starts executing.

### The request object
You might've already seen the `req` object being passed to middleware and callbacks. This is an object containing information about your current route. The object has the the following properties:
- `req.route` - A string containing the current route.
- `req.params` - An object with key-value pairs containing the route parameters. Note that number params (e.g. IDs) are converted to numbers. All others params are strings.

### Navigating to route
```javascript
router.navigate('/home');
```

Router instances also add event listeners to the window and document, so that `[router-href]` elements and browser back/forwards buttons can be used to trigger routes. Router.removeEventListeners() can be used to cleanup (i.e. remove) these event listeners.

```html
<!-- Click to navigate to the '/about' route. -->
<a href="" router-href="/about" title="See info about me">About</a>
```

> Note: if `router-href` is empty, the element will be treated as a normal link.

> Note 2: `router-href` can be used on any element, not just links. Be aware of accessibility concerns if doing this.

## Typescript
The package supports typings through .d.ts files. The following named exports are exported from the package:
- Router: class that creates a router.
- IRouterCallback: interface for the router middleware and callbacks.

## Browser support
TODO: Update table below.

| Browser                  | Supported? |
| :--                      | :--        |
| Chrome >= 55             | ✅         |
| Firefox >= 52            | ✅         |
| Safari >= 10.1           | ✅         |
| Opera >= 42              | ✅         |
| Edge >= 15               | ✅         |
| Internet Explorer        | ❌         |
| Chrome for Android > 55  | ✅         |
| Firefox for Android > 52 | ✅         |
| Opera for Android > 42   | ✅         |
| Safari for iOS > 10.3    | ✅         |
| Node.js                  | ❌         |

Browser support is mainly affected by use of the following:
- [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [async await syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

## Developing
```bash
npm run dev
```

Then just start editing the code in `/src`. If using an editor with good TypeScript support (e.g. VS Code), any errors will be inlined in the code as well.

> Note: Dev produces no output files.

## Testing
Integration testing:

```bash
npm run test:browsers
```

This will open a separate window where you can choose which browser to test in. Note that browsers are limited to browsers that are installed on your system _and_ [supported by Cypress](https://docs.cypress.io/guides/guides/launching-browsers.html#Browsers).

## Building
```bash
npm run build
```

> Note: Build will fail and report if there are errors.

## Publishing
Publish to npm:

```bash
npm run publish:npm
```

> Note: requires being [logged in to npm locally](https://docs.npmjs.com/cli/adduser).