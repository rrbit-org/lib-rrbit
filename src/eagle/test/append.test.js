import {CtorTrait} from '../shared/constructors';
import {AppendTrait} from '../append';
import {NthTrait} from '../nth';
import {createClass, DEPTHS} from './classUtil';
import {expect} from 'chai';
import jsonfile from 'jsonfile';

jsonfile.speces = 4;

function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function logToFile(obj) {
	jsonfile.writeFile('testdata.json', obj)
}


/*

// use simple object as base
var Vector = {
	make: function factory(len) {
		return { length: len }
	},
	...CtorTrait,
	...AppendTrait
};

/*/

var Vector = createClass(AppendTrait, NthTrait);

//*/

describe("eagle basic tests", function() {

	describe("basic construction tests", function() {
		var none;
		var uno;

		it('constructor tests', function() {
			none = Vector.empty();
			
			expect(none.length).to.equal(0);
			expect(none.depth).to.equal(1);
			expect(none.focusDepth).to.equal(1);
			expect(none.focusStart).to.equal(0);
			expect(none.focusEnd).to.equal(0);
			expect(none.focusRelax).to.equal(0);
			expect(none.focus).to.equal(0);
			expect(none.display0).to.be.an('array');
			expect(none.display1).to.equal(null);
		});

		it('prototype test', function() {
			try {

				expect(none.length).to.equal(0);
				expect(none).to.be.an.instanceOf(Vector);
				expect(none.append).to.be.a('function');
				uno = none.append(1, none)
			} catch(e) {
				// console.log('none',none.prototype)
				// console.log('uno', uno.prototype)
				throw e;
			}
		});

		function testSize(MAX, timeout) {
			it(`append ${pretty(MAX)} test`, function() {
				this.timeout(timeout || 1000);

				var vec = Vector.empty();

				for (var i = 0; MAX > i; i++) {
					
					vec = vec.append(i, vec);
				}
			});
		}


		testSize(10);
		testSize(DEPTHS[0]);
		testSize(DEPTHS[1]);
		testSize(DEPTHS[2]);
		testSize(DEPTHS[3]);
		// testSize(DEPTHS[4], 5000)
		// testSize(DEPTHS[5], 5000)

		it.skip('append 1,000,000 native test', function() {
			var vec = [];
			for (var i = 0; 1000000 > i; i++) {
				vec.push(i);
			}
		});
	});

	describe('ordered get/set confirmation', function() {

		function testOrdering(MAX) {
			it(`retrieves ${MAX} items in same order as inserted`, function() {
				var vec = Vector.empty();

				for (var i = 0; MAX > i; i++) {
					vec = vec.append(i, vec);
				}

				expect(vec.length).to.equal(MAX, 'length is not equal');
				
				for (var i = 0; MAX > i; i++) {
					expect(vec.nth(i, vec)).to.equal(i, 'value at position was wrong');
				}
			})
		}

		testOrdering(DEPTHS[0]);
		testOrdering(DEPTHS[1]);
		testOrdering(DEPTHS[2]);
		testOrdering(DEPTHS[3])
	})

});