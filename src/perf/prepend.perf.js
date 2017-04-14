import Immutable from 'immutable';
import mori from 'mori';
// import * as Eagle from '../../eagle'
import * as v2 from '../scratch/v2';
// import {} from '../shared/constructors';
import {AppendTrait} from '../append';
import {createClass, DEPTHS} from '../test/classUtil';
import {Cassowry} from '../cassowry/index';
Cassowry.empty = Cassowry.empty.bind(Cassowry)
Cassowry.prepend = Cassowry.prepend.bind(Cassowry)

// Vector as a class --------------------------------------------------

var Vector = createClass(AppendTrait)

//Vector as an object --------------------------------------------------

var VectorObj = {
	...AppendTrait
};

function factory(len) {
	return { length: len }
}

VectorObj.factory = factory;

describe('append/push comparisons', function() {

	it('immutable-js append 1k', function() {
		var list = Immutable.List();
		for (var i = 0; 1024 > i; i++) {
			list = list.unshift(i)
		}
	})

	it('mori vector unshift 1k', function() {
		// the original HAMT, highly optimized for append
		var list = mori.vector();
		for (var i = 0; 1024 > i; i++) {
			list = mori.concat(mori.vector(i), list)
		}
	})

	it.skip('proto 1k', function() {
		var list = Vector.empty();

		for (var i = 0; 1024 > i; i++) {
			list = list.append(i, list)
		}
	})

	it('cassowry prepend 1k', function() {
		var c = Cassowry
		var list = c.empty();
		var prepend = c.prepend

		for (var i = 0; 1023 > i; i++) {
			list = prepend(i, list)
		}
	})


	it('native unshift 1k mutating(max possible)', function() {
		var list = []
		for (var i = 0; 1024 > i; i++) {
			list.unshift(i)
		}
	})

	it('native unshift 1k immutable with es6 spread', function() {
		var list = []
		for (var i = 0; 1024 > i; i++) {
			list = [i, ...list]
		}
	})

});