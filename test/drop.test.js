import {Cassowry} from '../src/index';
import {range} from './testUtils';

import expect from 'jest-matchers';

describe('drop tests', () => {

	function dropSize(amount, src) {
		it(`can drop ${amount} of ${src.length}`, function() {
			var newLen = src.length - amount;
			var vec = Cassowry.drop(amount, src);

			expect(vec.length).toEqual(newLen);

			var len = vec.length;
			for (var i = 0; len > i; i++) {

				expect(Cassowry.nth(i, vec)).toEqual(i + amount)
			}

			// var sum = Cassowry.reduce(
			// 	(i, value) => {
			// 		expect(value).toEqual(i + amount);
			// 		return i + 1;
			// 	},
			// 	0,
			// 	vec
			// );

			// expect(sum).toEqual(newLen);
		});
	}

	function dropItLikeItsHot(src) {
		var sizes = [
			(src.length * 0.25) | 0,
			(src.length * 0.55) | 0,
			(src.length * 0.75) | 0,
			src.length | 0
		];

		sizes.forEach(size => dropSize(size, src));
	}

	dropItLikeItsHot(range(32));
	dropItLikeItsHot(range(64));
	dropItLikeItsHot(range(96));
	dropItLikeItsHot(range(1000));
	dropItLikeItsHot(range(1024));
	dropItLikeItsHot(range(32768));
	// dropItLikeItsHot(range(1048576));
});
