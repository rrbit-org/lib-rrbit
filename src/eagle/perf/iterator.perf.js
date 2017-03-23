import Immutable from 'immutable';
import mori from 'mori';
import {AppendTrait} from '../append';
import {iterator} from '../iterator';
import {createClass} from '../test/classUtil';

var Vector = createClass(AppendTrait)

Vector.prototype[Symbol.iterator] = function() {
	return iterator(0, this.length, this);
}



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
		list[Symbol.iterator] = list.undefined
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


// console.log('iterator symbol:', list_1k.mori['@@iterator'])
// console.log(list_1k.mori.undefined)
// console.log(list_1k.mori.prototype)
// console.log(list_1k.mori.toString.toString())

describe('', function() {

	it('mori iteration speed', function() {
		for (var value of list_1k.mori) {
			value + value;
		}
	})

	it('immutable-js iteration speed', function() {
		for (var value of list_1k.imm) {
			value + value;
		}
	})

	it('rrbit iteration speed', function() {
		for (var value of list_1k.rrbit) {
			value + value;
		}
	})

	it('native iteration speed', function() {
		for (var value of list_1k.native) {
			value + value;
		}
	})

	it.skip('native forEach speed', function() {
		list_1k.native.forEach(function(value) {
			value + value;
		})

	})

	it.skip('native for speed', function() {
		var list = list_1k.native
		for (var i=0; list.length > i; i++) {
			var value = list[i]
			value + value;
		}
	})

})