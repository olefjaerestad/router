# Router
Lightweight Javascript router to run certain functions at certain URL routes.

## Installation
```bash
npm i @olefjaerestad/router
```

## API/examples
TODO:


## Browser support
TODO: Update table below.

| Browser                  | Supported? |
| :--                      | :--        |
| Chrome >= 49             | ✅         |
| Firefox >= 18            | ✅         |
| Safari >= 10             | ✅         |
| Opera >= 36              | ✅         |
| Edge >= 12               | ✅         |
| Internet Explorer        | ❌         |
| Chrome for Android > 49  | ✅         |
| Firefox for Android > 18 | ✅         |
| Opera for Android > 36   | ✅         |
| Safari for iOS > 10      | ✅         |
| Node.js > 6.0.0          | ✅         |

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

## TODOs (prioritized order)
- Add some way of handling route transitions (e.g. fade from A to B).
- Improve documentation, both inline in code and in readme (e.g. add typescript specifics).
- Improve examples in code.