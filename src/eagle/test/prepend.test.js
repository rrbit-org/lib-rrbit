import {empty, one} from '../shared/constructors';
import {prepend} from '../prepend';
import nth from '../nth';
import {expect} from 'chai';

var DEPTHS = [
	32, // 0 depth (leaf only)
	1024, // 1 depth (default min depth)
	32768, // 2 depth
	1048576, // 3 depth (1M)
	33554432, // 4 depth (33.5M)
	1073741824 // 5 depth (1B) usually will cause out-of-memory by this point in current JS engines
]


function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function factory(len) {
	return { length: len }
}


describe('eagle prepend tests', function() {
	var pvec = empty(factory);
	// var MAX = 10000;
	var MAX = 100;

	it(`prepend ${pretty(MAX)} test`, function() {
		//*
		 for (var i = 0; MAX > i; i++) {
		 pvec = prepend(i, pvec, factory);
		 }
		 /*/
		try {
			for (var i = 0; MAX > i; i++) {
				pvec = prepend(i, pvec, factory);
			}
		} catch (e) {
			throw new Error(JSON.stringify(pvec))
		}
		//*/

	});

	it(`prepend ${pretty(MAX)} ordering test`, function() {
		for (var i = MAX; i--;) {
			expect(nth(i, pvec, 'missing')).to.equal(i);
		}
	});

	it.skip('prepend 1,000,000 native test', function() {
		this.timeout(5000)
		// var MAX = 1000000;// stop-the-world sec
		var MAX = 500000; // 2.8 sec
		// var MAX = 100000; // 2.8 sec
		// var MAX = 10000;  // 13 msec
		// var MAX = 1000;   // 0.13 sec
		var vec = [];
		for (var i = 0; MAX > i; i++) {
			vec.unshift(i);
		}
	});
})
	

