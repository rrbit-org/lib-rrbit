import Immutable from 'immutable';
import mori from 'mori';
// import * as Eagle from '../../eagle'
import * as v2 from '../../scratch/v2';
import {setupAsClass, mixin as CtorMixin} from '../shared/constructors';
import {mixin as AppendMixin} from '../append';

// Vector as a class --------------------------------------------------
function Vector(len) {
	this.length = len;
}

function create(len) {
	return new Vector(len)
}

setupAsClass(Vector, create);
AppendMixin(Vector.prototype);

//Vector as an object --------------------------------------------------

var VectorObj = {};

function factory(len) {
	return { length: len }
}

CtorMixin(VectorObj);
AppendMixin(VectorObj);

VectorObj.make = factory;

describe('append/push comparisons', function() {

	it('immutable-js append 1k', function() {
		var list = Immutable.List();
		for (var i = 0; 1000 > i; i++) {
			list = list.push(i)
		}
	})

	it('mori vector append 1k', function() {
		// the original HAMT, highly optimized for append
		var list = mori.vector();
		for (var i = 0; 1000 > i; i++) {
			list = mori.conj(list, i)
		}
	})

	it.skip('mori list append 1k', function() {
		// a linked list
		var list = mori.list();
		for (var i = 0; 1000 > i; i++) {
			list = mori.conj(list, i)
		}
	})

	it('proto 1k', function() {
		var list = Vector.empty();

		for (var i = 0; 1000 > i; i++) {
			list = list.append(i, list)
		}
	})

	it('proto 1k ǃ', function() {
		var list = Vector.empty();

		for (var i = 0; 1000 > i; i++) {
			list = list.appendǃ(i, list)
		}
	})

	it('obj 1k', function() {
		var list = VectorObj.empty();

		for (var i = 0; 1000 > i; i++) {
			list = VectorObj.append(i, list)
		}
	})

	it.skip('native 1k comparible(upper limit possible)', function() {
		// full array copy, resetting every 32 

		var list = [];
		for (var i = 0; 1000 > i; i++) {

			list = list.slice(0);
			list.push(i);
			if (list.length == 32)
				list = [];
		}
	})

	it.skip('native 1k comparible(w/xtra class init)', function() {
		function BaseClass() {}

		var list = []
		for (var i = 0; 1000 > i; i++) {
			// simulate extra copy operations
			var vec = new BaseClass();
			vec.focus = 0;
			vec.focusEnd = 0;
			vec.focusStart = 0;
			vec.focusDepth = 1;
			vec.focusRelax = 0;
			vec.display0 = [];
			vec.display1 = null;
			vec.display2 = null;
			vec.display3 = null;
			vec.display4 = null;
			vec.display5 = null;
			vec.depth = 1;

			list = list.slice(0);
			list.push(i);
			if (list.length == 32)
				list = []
		}
	})

	it('v2 1k', function() {
		var list = v2.empty()

		for (var i = 0; 1000 > i; i++) {
			list = v2.append(i, list)
		}
	})

	it('v2 1k !', function() {
		var list = v2.empty()

		for (var i = 0; 1000 > i; i++) {
			list = v2.appendǃ(i, list)
		}
	})

	it.skip('native push 1k mutating(max possible)', function() {
		var list = []
		for (var i = 0; 1000 > i; i++) {
			list.push(i)
		}
	})

});