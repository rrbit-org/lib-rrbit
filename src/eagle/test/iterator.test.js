import {AppendAllTrait} from '../appendAll';
import {NthTrait} from '../nth';
import {createClass, DEPTHS} from './classUtil';
import {iterator, reverseIterator} from '../iterator';
import {expect} from 'chai';


var Vector = createClass(AppendAllTrait, NthTrait);


function makeIterable(vec, isReverse) {
	if (isReverse) {
		return {
			[Symbol.iterator]: function() {
				return reverseIterator(0, vec.length, vec)
			}
		}
	}
	return {
		[Symbol.iterator]: function() {
			return iterator(0, vec.length, vec)
		}
	}
}

describe('eagle iterator tests', function() {


	describe.skip('forward iteration', function() {
		
		function testIterationSize(size) {
			it(`can iterate in order - ${size}`, function() {
				var vec = Vector.empty();

				for (var i = 0; size > i; i++) {
					vec = vec.append(i, vec);
				}

				var i = 0;
				for (var value of makeIterable(vec)) {
					expect(value).to.equal(i++)
				}

				expect(i).to.equal(size - 1)
			})
		}

		testIterationSize(DEPTHS[0]);
		testIterationSize(DEPTHS[1]);
		testIterationSize(DEPTHS[2]);
		testIterationSize(DEPTHS[3]);
	})

	describe('reverse iteration', function() {

		function testIterationSize(size) {
			it(`can iterate in reverse order - ${size}`, function() {
				var vec = Vector.empty();

				for (var i = 0; size > i; i++) {
					vec = vec.append(i, vec);
				}

				var i = vec.length;
				for (var value of makeIterable(vec, true)) {
					expect(value).to.equal(--i, 'iterated value was invalid')
				}

				expect(i).to.equal(0, 'length was not valid')
			})
		}

		testIterationSize(DEPTHS[0]);
		testIterationSize(DEPTHS[1]);
		testIterationSize(DEPTHS[2]);
		testIterationSize(DEPTHS[3]);
	})

	describe.skip('forward reduce', function() {
		var size = 1024;
		var vec = Vector.empty();

		for (var i = 0; size > i; i++) {
			vec = vec.append(i, vec);
		}

		it('can reduce', function() {
			var it = iterator(0, vec.length, vec);

			var total = it.reduce(function(acc, value) {
				expect(value).to.equal(acc);
				return acc + 1
			}, 0);

			expect(total).to.equal(vec.length - 1)
		});

	});


	describe('reverse reduce', function() {
		var size = 1024;
		var vec = Vector.empty();

		for (var i = 0; size > i; i++) {
			vec = vec.append(i, vec);
		}

		it('can reduce', function() {
			var it = reverseIterator(0, vec.length, vec);

			var total = it.reduce(function(acc, value) {
				expect(value).to.equal(--acc);
				return acc;
			}, 1024);

			expect(total).to.equal(0, 'total was incorrect');
		});

	})
});
