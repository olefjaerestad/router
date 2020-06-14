/// <reference types="cypress" />

import { Router } from '../../src/router';

const router = new Router();

describe('Router', () => {
	it('Should support \'get\' method.', () => {
		let changedByRouter = false;
		router.get('/home', () => changedByRouter = true);
		router.navigate('/home');
		expect(changedByRouter).to.be.true;
	});
	it('Should support \'delete\' method.', () => {
		let changedByRouter = false;
		router.get('/about', () => changedByRouter = true);
		router.delete('/about');
		router.navigate('/about');
		expect(changedByRouter).to.be.false;
	});
	it('Should support async callbacks.', () => {
		const getPromise = (): Promise<string> => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(text), 500);
			});
		}
		const text = 'I am the resolved value!';
		let resolvedValue: string = 'I am the original value';
		router.get('/shop', async () => {
			resolvedValue = await getPromise();
		});
		router.navigate('/shop');
		cy.wrap(resolvedValue).should(val => expect(resolvedValue).to.equal(text));
	});
	it('Should support (multiple) route params.', () => {
		let slug;
		router.get('/blog/:slug/:id/:test', (req) => slug = `${req.params.slug}/${req.params.id}/${req.params.test}`);
		router.navigate('/blog/hello-world/123/foo');
		expect(slug).to.equal('hello-world/123/foo');
	});
	it('Should convert route params to numbers if applicable.', () => {
		let slug;
		router.get('/blog/authors/:id', (req) => slug = req.params.id);
		router.navigate('/blog/authors/123');
		expect(slug).to.equal(123);
	});
	it('Should support adding event listeners.', () => {
		const anchor = document.createElement('a');
		let anchorTriggeredRouter = false;
		anchor.setAttribute('router-href', '/contact');
		document.body.append(anchor);
		router.get('/contact', () => anchorTriggeredRouter = true);
		anchor.click();
		expect(anchorTriggeredRouter).to.be.true;
	});
	it('Should support removing event listeners.', () => {
		const anchor = document.createElement('a');
		let anchorTriggeredRouter = false;
		anchor.setAttribute('router-href', '/blog');
		document.body.append(anchor);
		router.get('/blog', () => anchorTriggeredRouter = true);
		router.removeEventListeners();
		anchor.click();
		expect(anchorTriggeredRouter).to.be.false;
	});
	it('The Router instance should be available as `this` within non-arrow callbacks.', () => {
		let thisIsRouter = false;
		router.get('/this', function() {thisIsRouter = this instanceof Router});
		router.navigate('/this');
		expect(thisIsRouter).to.be.true;
	});
	it('Middleware should be able to stop the execution of the route callback.', () => {
		let changedByRouter = false;
		const middleware = () => {
			return false;
		}
		router.get('/middleware', middleware, () => changedByRouter = true);
		router.navigate('/middleware');
		expect(changedByRouter).to.be.false;
	});
	it('Middleware should be able to stop the execution of further middleware.', () => {
		let changedByRouter = false;
		const middleware1 = () => false;
		const middleware2 = () => changedByRouter = true;
		router.get('/middlewarestop', middleware1, middleware2, () => null);
		router.navigate('/middlewarestop');
		expect(changedByRouter).to.be.false;
	});
	it('Should support async middleware.', () => {
		const getPromise = (): Promise<string> => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(text), 500);
			});
		}
		const middleware = async () => {
			return false;
			// const result = await getPromise();
			// console.log('result', result, result !== text);
			// return result !== text;
		};
		const text = 'I am the resolved value!';
		let changedByRouter = false;
		router.get('/asyncmiddleware', middleware, () => changedByRouter = true);
		router.navigate('/asyncmiddleware');
		cy.wrap(changedByRouter).should(val => expect(changedByRouter).to.be.false);
		// expect(changedByRouter).to.be.false;
	});
});