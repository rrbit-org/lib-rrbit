import Immutable from 'immutable';
import mori from 'mori';
import _ from 'lodash'
// import {AppendTrait} from '../append';
// import {iterator} from '../iterator';
// import {createClass} from '../test/classUtil';
import {Cassowry} from '../src/index'
Cassowry.reduce = Cassowry.reduce.bind(Cassowry)
Cassowry.append = Cassowry.append.bind(Cassowry)
Cassowry.empty = Cassowry.empty.bind(Cassowry)

// var Vector = createClass(AppendTrait)
//
// Vector.prototype[Symbol.iterator] = function() {
// 	return iterator(0, this.length, this);
// }



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
	// rrbit: (function(){
	// 	var list = Vector.empty();
	//
	// 	for (var i = 0; 1000 > i; i++) {
	// 		list = list.append(i, list)
	// 	}
	// 	return list
	// })(),
	native: (function(){
		var list = []

		for (var i = 0; 1000 > i; i++) {
			list.push(i)
		}
		return list
	})(),
	cass: (function(){
		var list = Cassowry.empty();

		for (var i = 0; 1000 > i; i++) {
			list = Cassowry.append(i, list)
		}
		return list
	})()

};


// console.log('iterator symbol:', list_1k.mori['@@iterator'])
// console.log(list_1k.mori.undefined)
// console.log(list_1k.mori.prototype)
// console.log(list_1k.mori.toString.toString())

describe('', function() {

	it('mori for-of speed', function() {
		for (var value of list_1k.mori) {
			value + value;
		}
	})

	it('immutable-js for-of speed', function() {
		for (var value of list_1k.imm) {
			value + value;
		}
	})

	// it('rrbit for-of speed', function() {
	// 	for (var value of list_1k.rrbit) {
	// 		value + value;
	// 	}
	// })
	//
	// it('rrbit reduce speed', function() {
	// 	var it = iterator(0, list_1k.rrbit.length, list_1k.rrbit);
	// 	it.reduce(function(acc, value) {
	// 		value + value;
	// 	}, null);
	// });
	it('rrbit:cassowry reduce speed', function() {
		Cassowry.reduce(function(acc, value) {
			value + value;
		}, list_1k.cass, 0)
	});

	it.skip('native for-of speed', function() {
		for (var value of list_1k.native) {
			value + value;
		}
	})

	it('native forEach speed', function() {
		list_1k.native.forEach(function(value) {
			value + value;
		})

	})

	it('native for speed', function() {
		var list = list_1k.native
		for (var i=0; list.length > i; i++) {
			var value = list[i]
			value + value;
		}
	})
	it('lodash forEach speed', function() {
		var list = list_1k.native
		_.reduce(list, (_, value) => {
			value + value
		})
	})

})