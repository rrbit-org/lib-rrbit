import {empty, one} from '../shared/constructors';
import {append} from '../append';
import iterator from '../iterator';
import {expect} from 'chai';

var DEPTHS = [
	32, // 0 depth (leaf only)
	1024, // 1 depth (default min depth)
	32768, // 2 depth
	1048576, // 3 depth (1M)
	33554432, // 4 depth (33.5M)
	1073741824 // 5 depth (1B) usually will cause out-of-memory by this point in current JS engines
]

function factory(len) {
	return { length: len }
}

function makeIterable(vec) {
	return {
		[Symbol.iterator]: function() {
			return iterator(0, vec.length, vec)
		}
	}
}

describe('eagle iterator tests', function() {


	describe('forward iteration', function() {

		it('can iterate in order 1k', function() {
			var size = 1000
			var vec = empty(factory);

			for (var i = 0; size > i; i++) {
				vec = append(i, vec, factory);
			}

			var i = 0;
			for (var value of makeIterable(vec)) {
				expect(value).to.equal(i++)
			}

			expect(i).to.equal(size - 1)
		})

		it('can iterate in order 10k', function() {
			var size = 10000;
			var vec = empty(factory);

			for (var i = 0; size > i; i++) {
				vec = append(i, vec, factory);
			}

			var i = 0;
			for (var value of makeIterable(vec)) {
				expect(value).to.equal(i++)
			}

			expect(i).to.equal(size - 1)
		})
	})
})
