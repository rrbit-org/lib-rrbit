import Immutable from 'immutable';
import mori from 'mori';
import {iterator} from '../iterator';
import {AppendTrait} from '../append';
import {AppendAllTrait} from '../appendAll';
import {DropTrait} from '../drop';
import {createClass} from '../test/classUtil';

var Vector = createClass(AppendTrait, AppendAllTrait);


function generate(LEN) {
	return {
		imm: (function() {
			var list = Immutable.List();
			for (var i = 0; LEN > i; i++) {
				list = list.push(i)
			}
			return list;
		})(),
		mori: (function() {
			var list = mori.vector();
			for (var i = 0; LEN > i; i++) {
				list = mori.conj(list, i)
			}
			// list[Symbol.iterator] = list.undefined
			return list;
		})(),
		rrbit: (function() {
			var list = Vector.empty();

			for (var i = 0; LEN > i; i++) {
				list = list.append(i, list)
			}
			return list
		})(),
		native: (function() {
			var list = [];

			for (var i = 0; LEN > i; i++) {
				list.push(i)
			}
			return list
		})(),

	};
}

var list1k = generate(10000);
var list2k = generate(20000);
var list3k = generate(30000);

describe('concat performance comparisons', function() {

	it('mori concat speed', function() {
		var x = mori.concat(list1k.mori, list3k.mori)
		mori.concat(x, list2k.mori)
	})

	it('immutable-js concat speed', function() {
		list1k.imm.concat(list2k.imm).concat(list3k.imm)
	})

	it('rrbit concat speed', function() {
		var vec = list1k.rrbit;
		var v2 = vec.appendAll(vec, list2k.rrbit)
		vec.appendAll(v2, list3k.rrbit)

	})

	it('rrbit appendǃ + speed', function() {
		var api = list1k.rrbit;
		var vec = api.empty();
		iterator(0, list1k.rrbit.length, list1k.rrbit)
			.reduce(function(list, val) {
				return list.appendǃ(val, list)
			}, vec);

		iterator(0, list2k.rrbit.length, list2k.rrbit)
			.reduce(function(list, val) {
				return list.appendǃ(val, list)
			}, vec);

		iterator(0, list3k.rrbit.length, list3k.rrbit)
			.reduce(function(list, val) {
				return list.appendǃ(val, list)
			}, vec);

	})

	it('native concat speed', function() {
		list1k.native.concat(list2k.native).concat(list3k.native)
	});

})