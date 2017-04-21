import {NthTrait} from '../nth';
import {PrependTrait} from '../prepend';
import {AppendTrait} from '../append';
import {DEPTHS, createClass} from './classUtil';
import {expect} from 'chai';


function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


var Vector = createClass(AppendTrait, NthTrait, PrependTrait);

describe('eagle prepend tests', function() {

	function testSize(MAX) {
		it(`prepend ${pretty(MAX)} ordering test`, function() {
			var vec = Vector.empty();
			try {
				for (var i = 0; MAX > i; i++) {
					vec = vec.prepend(i, vec);
				}
			}
			catch(e) {
				console.log("i: ", i)
				// console.log(vec);
				throw e
			}

			try {
				var n = MAX;
				for (var i = 0; MAX > i; i++) {
					expect(vec.nth(i, vec, 'missing')).to.equal(--n);
				}

			} catch(e) {
				console.log("i: ", i)
				console.log(vec);
				throw e
			}
		});
	}

	// testSize(64);
	testSize(1057);
	// testSize(DEPTHS[0]);
	// testSize(DEPTHS[1]);
	// testSize(DEPTHS[2]);
	// testSize(DEPTHS[3]);

})
	

