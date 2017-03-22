import {setupAsClass, mixin as CtorMixin} from '../shared/constructors';
import {mixin as AppendMixin} from '../append';
import {NthMixin} from '../nth';
// import {nth} from '../nth';
import {expect} from 'chai';
import jsonfile from 'jsonfile';

jsonfile.speces = 4;

var DEPTHS = [
	32, // 0 depth (leaf only)
	1024, // 1 depth (default min depth)
	32768, // 2 depth
	1048576, // 3 depth (1M)
	33554432, // 4 depth (33.5M)
	1073741824 // 5 depth (1B) usually will cause out-of-memory by this point in current JS engines
];

function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function logToFile(obj) {
	jsonfile.writeFile('testdata.json', obj)
}


/*

// use simple object as base
var Vector = {};
function factory(len) {
    return { length: len }
}
CtorMixin(Vector)
AppendMixin(Vector);

Vector.make = factory;

/*/
// use class as base
function Vector(len) {
	this.length = len;
}

function create(len) {
	return new Vector(len)
}

setupAsClass(Vector, create);
AppendMixin(Vector.prototype);
NthMixin(Vector.prototype);


// Vector.prototype.append = function(value) {
// 	return Vector.prototype.append(value, this);
// }
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