/// <reference types="cypress" />

import { Router, IRouterCallback } from '../../src/router';

const router = new Router();

describe('Router', () => {
	it('Should support \'get\' method.', () => {
		let changedByRouter = false;
		router.get('/home', () => changedByRouter = true);
		router.navigate('/home');
		expect(changedByRouter).to.be.true;
	});
	it('Should support multiple \'get\' methods to the same route.', () => {
		let callCount = 0;
		router.get('/multipleget', () => ++callCount);
		router.get('/multipleget', () => ++callCount);
		router.navigate('/multipleget');
		cy.wrap(callCount).should(val => expect(callCount).to.be.equal(2));
	});
	it('\'get\' method should run registered route immediately if registered route equals current route.', () => {
		let changedByRouter = false;
		router.navigate('/');
		router.get('/', () => changedByRouter = true);
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
	it('Should support fallback \'/404\' route.', () => {
		let changedByRouter = false;
		router.get('/404', () => changedByRouter = true);
		router.navigate('/idontexist');
		expect(changedByRouter).to.be.true;
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
	it('Avoid adding multiple identical event listeners when using multiple routers.', () => {
		const router2 = new Router();
		const anchor = document.createElement('a');
		let anchorTriggeredRouter = false;
		anchor.setAttribute('router-href', '/multiplelisteners');
		document.body.append(anchor);
		router.get('/multiplelisteners', () => anchorTriggeredRouter = !anchorTriggeredRouter);
		anchor.click();
		expect(anchorTriggeredRouter).to.be.true;
	});
	it('Event listeners should trigger for all instances when using multiple routers.', () => {
		const router2 = new Router();
		const anchor = document.createElement('a');
		let anchorTriggeredRouter = false;
		anchor.setAttribute('router-href', '/multiplerouters');
		document.body.append(anchor);
		router.get('/multiplerouters', () => anchorTriggeredRouter = !anchorTriggeredRouter);
		router2.get('/multiplerouters', () => anchorTriggeredRouter = !anchorTriggeredRouter);
		anchor.click();
		expect(anchorTriggeredRouter).to.be.false;
	});
	it('Should support removing event listeners.', () => {
		const anchor = document.createElement('a');
		let anchorTriggeredRouter = false;
		anchor.setAttribute('router-href', '/blog');
		document.body.append(anchor);
		router.get('/blog', () => anchorTriggeredRouter = true);
		router.removeEventListeners();
		anchor.addEventListener('click', e => e.preventDefault());
		anchor.click();
		expect(anchorTriggeredRouter).to.be.false;
	});
	it('The Router instance should be available as `this` within non-arrow callbacks.', () => {
		let thisIsRouter = false;
		router.get('/this', function () { thisIsRouter = this === router });
		router.navigate('/this');
		expect(thisIsRouter).to.be.true;
	});
	it('Middleware should be able to stop the execution of the route callback.', () => {
		let changedByRouter = false;
		const middleware: IRouterCallback = () => false;
		router.get('/middleware', middleware, () => changedByRouter = true);
		router.navigate('/middleware');
		cy.wrap(changedByRouter).should(val => expect(changedByRouter).to.be.false);
	});
	it('Middleware should be able to stop the execution of further middleware.', () => {
		let changedByRouter = false;
		const middleware1: IRouterCallback = () => false;
		const middleware2: IRouterCallback = () => changedByRouter = true;
		router.get('/middlewarestop', middleware1, middleware2, () => null);
		router.navigate('/middlewarestop');
		cy.wrap(changedByRouter).should(val => expect(changedByRouter).to.be.false);
	});
	it('Middleware should only stop the execution of callback/middleware that were registered in the same \'get\' call as it.', () => {
		let callCount = 0;
		const middleware: IRouterCallback = () => false;
		router.get('/middlewaresame', middleware, () => ++callCount);
		router.get('/middlewaresame', () => ++callCount);
		router.navigate('/middlewaresame');
		expect(callCount).to.equal(1);
	});
	it('Middleware should be able to modify the req object.', () => {
		let changedByRouter = false;
		const middleware: IRouterCallback = (req) => req.custom = 'foo';
		router.get('/middlewaremodifyreq', middleware, (req) => req.custom === 'foo' ? changedByRouter = true : null);
		router.navigate('/middlewaremodifyreq');
		cy.wrap(changedByRouter).should(val => expect(changedByRouter).to.be.true);
	});
	it('Middleware should be able to modify the req object across \'get\' calls.', () => {
		let myValue: string | number = '';
		const middleware: IRouterCallback = (req) => req.params.testValue = 'hello';
		router.get('/middlewareacrossgets', middleware, () => myValue = 'world');
		router.get('/middlewareacrossgets', (req) => myValue = req.params.testValue);
		router.navigate('/middlewareacrossgets');
		expect(myValue).to.equal('hello');
	});
	it('Should support async middleware.', () => {
		const getPromise = (): Promise<string> => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(text), 500);
			});
		}
		const middleware: IRouterCallback = async () => await getPromise() === text;
		const text = 'I am the resolved value!';
		let changedByRouter = false;
		router.get('/asyncmiddleware', middleware, () => changedByRouter = true);
		router.navigate('/asyncmiddleware');
		cy.wrap(changedByRouter).should(val => expect(changedByRouter).to.be.true);
	});
});