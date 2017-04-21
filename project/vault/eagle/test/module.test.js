import {setup} from '../index';
import {expect} from 'chai'


describe('module test', () => {

	function Neu(len) {
		this.length = len;
	}

	function factory(len) {
		return new Neu(len);
	}

	it('loads all operations', () => {

		var lib = setup(factory);
		expect(lib.empty).to.be.a('function')
		expect(lib.append).to.be.a('function')
		expect(lib.prepend).to.be.a('function')
		expect(lib.appendAll).to.be.a('function')
		expect(lib.nth).to.be.a('function')
		expect(lib.update).to.be.a('function')
		expect(lib.take).to.be.a('function')
		expect(lib.drop).to.be.a('function')
		expect(lib.append.bind).to.be.a('function')
	})

	it('loads all operations', () => {

		var lib = setup(factory);
		var vec = lib.empty();

		expect(vec).to.be.an.instanceof(Neu)
	})


});