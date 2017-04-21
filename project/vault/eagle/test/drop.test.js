import {DropTrait} from '../drop';
import {NthTrait} from '../nth';
import {AppendTrait} from '../append';
import {iterator} from '../iterator';
import {createClass, DEPTHS} from './classUtil';
import {expect} from 'chai';

var Vector = createClass(DropTrait, NthTrait, AppendTrait);

function range(size) {
	var vec = Vector.empty();

	for (var i = 0; size > i; i++) {
		vec = vec.append(i, vec);
	}

	return vec;
}

function makeIterable(vec) {
	return {
		[Symbol.iterator]: function() {
			return iterator(0, vec.length, vec)
		}
	}
}

describe('eagle drop() tests', function() {

	var vec_32 = range(DEPTHS[0]);
	var vec_1024 = range(DEPTHS[1]);
	var vec_32k = range(DEPTHS[2]);
	var vec_1_04M = range(DEPTHS[3]);

	function dropSize(amount, name, src) {
		it(`can drop ${amount} of ${src.length}`, function() {

			var newLen = src.length - amount;
			var vec = src.drop(amount, src);

			var i = 0;
			for (var value of makeIterable(vec)) {
				expect(value).to.equal(i + amount)
				i++
			}
		})
	}

	function dropItLikeItsHot(src) {
		var sizes = {
			a: Math.round(src.length * 0.25),
			b: Math.round(src.length * 0.55),
			c: Math.round(src.length * 0.75),
			d: Math.round(src.length)
		};

		for (var key in sizes) {
			dropSize(sizes[key], key, src)
		}

	}

	dropItLikeItsHot(vec_32);
	dropItLikeItsHot(vec_1024);
	dropItLikeItsHot(vec_32k);
	dropItLikeItsHot(vec_1_04M);
});