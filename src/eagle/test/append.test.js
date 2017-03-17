import {empty} from '../shared/constructors';
import {append} from '../append';
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

describe("rrb with focus tests", function() {

	describe("basic construction tests", function() {
		var none;
		var uno;

		it('constructor tests', function() {
			none = empty(factory);
		});

		function testSize(MAX, timeout) {
			it(`append ${pretty(MAX)} test`, function() {
				this.timeout(timeout || 2000)
				var vec = empty(factory);
				for (var i = 0; MAX > i; i++) {
					vec = append(i, vec, factory);
				}
			});
		}

		for (var MAX of [32, 1024, 32768, 1048576]) {
			testSize(MAX, 1000)
		}

		// testSize(33554432, 4000);
		// testSize(1073741824, 4000);

		it.skip('append 1,000,000 native test', function() {
			var vec = [];
			for (var i = 0; 1000000 > i; i++) {
				vec.push(i);
			}
		});
	});

	describe('ordered get/set confirmation', function() {

		it('retrieves 10000 items in same order as inserted', function() {
			var MAX = 10000
			var vec = empty(factory);

			for (var i = 0; MAX > i; i++) {
				vec = append(i, vec, factory);
			}

			for (var i = 0; MAX > i; i++) {
				expect(nth(i, vec)).to.equal(i);
			}
			expect(vec.length).to.equal(MAX)
		})
	})

})