import {Cassowry} from '../src/index';
import {iterator} from '../src/iterator';
import {DEPTHS, range} from './testUtils';

import expect from 'jest-matchers';

function makeIterable(vec, isReverse) {
	// if (isReverse) {
	// 	return {
	// 		[Symbol.iterator]: function() {
	// 			return reverseIterator(0, vec.length, vec)
	// 		}
	// 	}
	// }
	return {
		[Symbol.iterator]: function() {
			return iterator(0, vec.length, vec)
		}
	}
}

describe('reduce tests', () => {
	function testSize(SIZE) {
		it('reduce over ' + SIZE, () => {
			var vec = range(SIZE);

			var sum = Cassowry.reduce(
				(sum, value) => {
					expect(sum).toEqual(value);
					return sum + 1;
				},
				0,
				vec
			);

			expect(sum).toEqual(vec.length, 'sum was not as expected');
		});
	}

	testSize(DEPTHS[0]);
	testSize(DEPTHS[1]);
	testSize(DEPTHS[2]);
	testSize(DEPTHS[3]);
	// testSize(DEPTHS[4])
});

describe.skip('forward iteration', function() {
	function testIterationSize(size) {
		it(`can iterate in order - ${size}`, function() {
			var vec = range(SIZE);

			var i = 0;
			for (var value of vec) {
				expect(value).toEqual(i++);
			}

			expect(i).toEqual(size - 1);
		});
	}

	testIterationSize(DEPTHS[0]);
	testIterationSize(DEPTHS[1]);
	// testIterationSize(DEPTHS[2]);
	// testIterationSize(DEPTHS[3]);
});

describe('reverse reduce', function() {
	var size = 1028;
	var vec = range(size);

	it('can reduce in reverse over aft + tree', function() {

		var total = Cassowry.reduceRight(function(acc, value) {
			expect(value).toEqual(--acc);
			return acc;
		}, size, vec);

		expect(total).toEqual(0, 'total was incorrect');
	});

	it('can reduce in reverse over pre + tree', function() {
		var vec = Cassowry.empty();
		var i = 48;
		while (i--) {
			vec = Cassowry.prepend(i, vec);
		}

		var total = Cassowry.reduceRight(function(acc, value) {
			expect(value).toEqual(--acc);
			return acc;
		}, 48, vec);

		expect(total).toEqual(0, 'total was incorrect');
	});

})

describe.skip('reverse iteration', function() {

	function testIterationSize(size) {
		it(`can iterate in reverse order - ${size}`, function() {
			var vec = range(size)

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