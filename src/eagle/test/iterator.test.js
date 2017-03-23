import {AppendAllTrait} from '../appendAll';
import {NthTrait} from '../nth';
import {createClass, DEPTHS} from './classUtil';
import {iterator} from '../iterator';
import {expect} from 'chai';


var Vector = createClass(AppendAllTrait, NthTrait);


function makeIterable(vec) {
	return {
		[Symbol.iterator]: function() {
			return iterator(0, vec.length, vec)
		}
	}
}

describe('eagle iterator tests', function() {


	describe('forward iteration', function() {
		
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

	describe('forward reduce', function() {
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

	})
})
