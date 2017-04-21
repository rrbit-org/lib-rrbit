import {Cassowry} from './index'
import {range} from './testUtils'

import expect from 'jest-matchers'



describe('drop tests', () => {

	var vec_32 = range(32);
	var vec_64 = range(64);
	var vec_96 = range(96);
	var vec_1k = range(1000);
	var vec_1024 = range(1024);

	function dropSize(amount, src) {
		it(`can drop ${amount} of ${src.length}`, function() {

			var newLen = src.length - amount;
			var vec = Cassowry.drop(amount, src);

			expect(vec.length).toEqual(newLen)
			var sum = Cassowry.reduce((i, value) => {
				expect(value).toEqual(i + amount);
				return i + 1
			}, 0, vec);

			expect(sum).toEqual(newLen)
		})
	}

	function dropItLikeItsHot(src) {
		var sizes = [
			(src.length * 0.25) | 0
			, (src.length * 0.55) | 0
			, (src.length * 0.75) | 0
			, (src.length) | 0
		];

		sizes.forEach(size => dropSize(size, src));

	}

	dropItLikeItsHot(vec_32);
	dropItLikeItsHot(vec_64);
	dropItLikeItsHot(vec_96);
	dropItLikeItsHot(vec_1k);
	dropItLikeItsHot(vec_1024);
})