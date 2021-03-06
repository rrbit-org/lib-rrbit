import Immutable from 'immutable';
import mori from 'mori';
// import * as Eagle from '../../eagle'

// import {} from '../shared/constructors';
// import {AppendTrait} from '../append';
// import {createClass, DEPTHS} from '../test/classUtil';
import {Cassowry} from '../src/index';

Cassowry.empty = Cassowry.empty.bind(Cassowry);
Cassowry.appendǃ = Cassowry.appendǃ.bind(Cassowry);
Cassowry.append = Cassowry.append.bind(Cassowry);

// Vector as a class --------------------------------------------------

// var Vector = createClass(AppendTrait)

//Vector as an object --------------------------------------------------

// var VectorObj = {
// 	...AppendTrait
// };

// function factory(len) {
// 	return { length: len }
// }

// VectorObj.factory = factory;

describe('append/push comparisons', function() {
	it.skip('immutable-js append 1k', function() {
		var list = Immutable.List();
		for (var i = 0; 1000 > i; i++) {
			list = list.push(i);
		}
	});

	it('mori vector append 1k', function() {
		// the original HAMT, highly optimized for append
		var list = mori.vector();
		for (var i = 0; 1000 > i; i++) {
			list = mori.conj(list, i);
		}
	});

	it.skip('mori list append 1k', function() {
		// a linked list
		var list = mori.list();
		for (var i = 0; 1000 > i; i++) {
			list = mori.conj(list, i);
		}
	});

	// it('eagle 1k', function() {
	// 	var list = Vector.empty();
	//
	// 	for (var i = 0; 1000 > i; i++) {
	// 		list = list.append(i, list)
	// 	}
	// })
	//
	// it('eagle 1k ǃ', function() {
	// 	var list = Vector.empty();
	//
	// 	for (var i = 0; 1000 > i; i++) {
	// 		list = list.appendǃ(i, list)
	// 	}
	// })
	it('cassowry 1k', function() {
		var list = Cassowry.empty();
		var append = Cassowry.append;

		for (var i = 0; 1000 > i; i++) {
			list = append(i, list);
		}
	});

	it('cassowry 1k ǃ', function() {
		var list = Cassowry.empty();
		var append = Cassowry.appendǃ;

		for (var i = 0; 1000 > i; i++) {
			list = append(i, list);
		}
	});

	it.skip('obj 1k', function() {
		var list = VectorObj.empty();

		for (var i = 0; 1000 > i; i++) {
			list = VectorObj.append(i, list);
		}
	});

	it.skip('native 1k comparible(upper limit possible)', function() {
		// full array copy, resetting every 32

		var list = [];
		for (var i = 0; 1000 > i; i++) {
			list = list.slice(0);
			list.push(i);
			if (list.length == 32) list = [];
		}
	});

	it.skip('native 1k comparible(w/xtra class init)', function() {
		function BaseClass() {
		}

		var list = [];
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
			if (list.length == 32) list = [];
		}
	});

	it('native push 1k mutating(max possible)', function() {
		var list = [];
		for (var i = 0; 1000 > i; i++) {
			list.push(i);
		}
	});
	it.skip('native push 1k immutable with es6 spread', function() {
		var list = [];
		for (var i = 0; 1000 > i; i++) {
			list = [...list, i];
		}
	});
});
