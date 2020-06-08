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
	// TODO: this doesn't pass.
	it('Should support async callbacks.', () => {
		const text = 'I am the resolved value!';
		const getPromise = () => {
			return new Promise((resolve, reject) => {
				setTimeout(() => resolve(text), 1000);
			});
		}
		let resolvedValue: any = 'hey';
		router.get('/shop', async () => {
			// console.log('inside: before');
			resolvedValue = await getPromise();
			// console.log('inside: after');
			// expect(resolvedValue).to.equal('ewfre');
		});
		// console.log('outside: before');
		router.navigate('/shop');
		// console.log('outside: after');
		expect(resolvedValue).to.equal(text);
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
});