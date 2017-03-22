import {AppendAllTrait} from '../appendAll';
import {NthTrait} from '../nth';
import {createClass, DEPTHS} from './classUtil';
import {expect} from 'chai';

var Vector = createClass(AppendAllTrait, NthTrait);


describe("eagle: appendAll tests", function() {

	describe('basic concat tests', function() {

		function testConcatWithLength(size, tOut = 2000) {
			it(`joins two lists of ${size} together`, function() {
				this.timeout(tOut);
				var vec = Vector.empty();

				for (var i = 0; size > i; i++) {
					vec = vec.append(i, vec);
				}

				var joined = vec.appendAll(vec, vec);
				expect(joined.length).to.equal(size * 2)

				for (var i = 0; size > i; i++) {
					expect(vec.nth(i, joined)).to.equal(i);
					expect(vec.nth(i + size, joined)).to.equal(i);
				}
			})
		}

		testConcatWithLength(32);
		testConcatWithLength(DEPTHS[1]);
		testConcatWithLength(DEPTHS[2]);
		testConcatWithLength(DEPTHS[3], 5000);
		// bigger than this is scary...


	})


});