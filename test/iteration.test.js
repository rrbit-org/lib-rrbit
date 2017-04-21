import {Cassowry} from '../src/index';
import {iterator} from '../src/iterator';
import {DEPTHS, range} from './testUtils';

import expect from 'jest-matchers';

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
