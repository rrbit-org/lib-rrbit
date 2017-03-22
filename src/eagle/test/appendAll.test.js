import {AppendAllTrait} from '../appendAll';
import {NthTrait} from '../nth';
import {createClass} from './classUtil';
import {expect} from 'chai';

var Vector = createClass(AppendAllTrait, NthTrait);

var DEPTHS = [
	32, // 0 depth (leaf only)
	1024, // 1 depth (default min depth)
	32768, // 2 depth
	1048576, // 3 depth (1M)
	33554432, // 4 depth (33.5M)
	1073741824 // 5 depth (1B) usually will cause out-of-memory by this point in current JS engines
]


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