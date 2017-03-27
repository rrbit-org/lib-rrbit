import {TakeTrait} from '../take';
import {NthTrait} from '../nth';
import {AppendTrait} from '../append';
import {iterator} from '../iterator';
import {createClass, DEPTHS} from './classUtil';
import {expect} from 'chai';

var Vector = createClass(TakeTrait, NthTrait, AppendTrait);

function makeIterable(vec) {
	return {
		[Symbol.iterator]: function() {
			return iterator(0, vec.length, vec)
		}
	}
}

function range(size) {
	var vec = Vector.empty();

	for (var i = 0; size > i; i++) {
		vec = vec.append(i, vec);
	}

	return vec;
}

describe('eagle drop() tests', function() {

	var vec_32 = range(DEPTHS[0]);
	var vec_1024 = range(DEPTHS[1]);
	var vec_32k = range(DEPTHS[2]);
	var vec_1_04M = range(DEPTHS[3]);

	function takeSize(amount, name, src) {
		it(`can take ${amount} of ${src.length}`, function() {

			var vec = src.take(amount, src);

			expect(amount).to.equal(vec.length, 'total length was wrong');

			// for (var i = 0; vec.length > i; i++) {
			// 	expect(vec.nth(i, vec)).to.equal(i, name)
			// }
			var i = 0;
			for (var value of makeIterable(vec)) {
				expect(value).to.equal(i++)
			}
		})
	}

	function takeALitteLeaveALittle(src) {
		var sizes = {
			a: Math.round(src.length * 0.25),
			b: Math.round(src.length * 0.55),
			c: Math.round(src.length * 0.75),
			e: Math.round(src.length * 0.85),
			f: Math.round(src.length * 0.95)
			// z: Math.round(src.length)
		};

		for (var key in sizes) {
			takeSize(sizes[key], key, src)
		}

	}

	takeALitteLeaveALittle(vec_32);
	takeALitteLeaveALittle(vec_1024);
	takeALitteLeaveALittle(vec_32k);
	takeALitteLeaveALittle(vec_1_04M);
});