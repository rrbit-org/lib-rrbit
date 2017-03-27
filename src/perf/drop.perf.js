import Immutable from 'immutable';
import mori from 'mori';
import {AppendTrait} from '../append';
import {DropTrait} from '../drop';
import {createClass} from '../test/classUtil';

var Vector = createClass(AppendTrait, DropTrait)





var list_1k = {
	imm: (function(){
		var list = Immutable.List();
		for (var i = 0; 1000 > i; i++) {
			list = list.push(i)
		}
		return list;
	})(),
	mori: (function(){
		var list = mori.vector();
		for (var i = 0; 1000 > i; i++) {
			list = mori.conj(list, i)
		}
		// list[Symbol.iterator] = list.undefined
		return list;
	})(),
	rrbit: (function(){
		var list = Vector.empty();

		for (var i = 0; 1000 > i; i++) {
			list = list.append(i, list)
		}
		return list
	})(),
	native: (function(){
		var list = []

		for (var i = 0; 1000 > i; i++) {
			list.push(i)
		}
		return list
	})(),

};

describe('', function() {

	it('mori drop speed', function() {
		mori.drop(256, list_1k.mori)
	})

	it('immutable-js drop speed', function() {
		list_1k.imm.slice(256, 1024)
	})

	it('rrbit drop speed', function() {
		var vec = list_1k.rrbit;
		vec.drop(256, vec)
	})

	it('native drop speed', function() {
		list_1k.native.slice(256, 1024)
	});

})