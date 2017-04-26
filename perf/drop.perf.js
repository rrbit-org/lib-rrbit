import Immutable from 'immutable';
import mori from 'mori';
import {Cassowry} from '../src/index';


var SIZE = 1024;
var DROP = 256;
var list_1k = {
	imm: (function() {
		var list = Immutable.List();
		for (var i = 0; SIZE > i; i++) {
			list = list.push(i);
		}
		return list;
	})(),
	mori: (function() {
		var list = mori.vector();
		for (var i = 0; SIZE > i; i++) {
			list = mori.conj(list, i);
		}
		// list[Symbol.iterator] = list.undefined
		return list;
	})(),
	cass: (function() {
		var vec = Cassowry.empty();
		for (var i = 0; SIZE > i; i++) {
			vec = Cassowry.appendǃ(i, vec);
		}
		return vec;
	})(),
	native: (function() {
		var list = [];

		for (var i = 0; SIZE > i; i++) {
			list.push(i);
		}
		return list;
	})()
};

describe('drop performance tests', function() {

	it('mori drop speed', function() {
		mori.drop(DROP, list_1k.mori);
	});

	it('immutable-js drop speed', function() {
		list_1k.imm.slice(DROP, SIZE);
	});

	it('cassowry drop speed', function() {
		var vec = list_1k.cass;
		Cassowry.drop(DROP, vec);
	});

	it('native drop speed', function() {
		list_1k.native.slice(DROP, SIZE);
	});
});
