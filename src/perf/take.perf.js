import Immutable from 'immutable';
import mori from 'mori';


import {AppendTrait} from '../append';
import {TakeTrait} from '../take';
import {createClass, DEPTHS} from '../test/classUtil';
import {Cassowry} from '../cassowry/index';

// Vector as a class --------------------------------------------------

var Vector = createClass(AppendTrait, TakeTrait);

Cassowry.empty = Cassowry.empty.bind(Cassowry)
Cassowry.appendǃ = Cassowry.appendǃ.bind(Cassowry)

Cassowry.take = Cassowry.take.bind(Cassowry)

function cRange(size) {
	var vec = Cassowry.empty();

	for (var i = 0; size > i; i++) {
		vec = Cassowry.appendǃ(i, vec);
	}
	return vec;
}

function eRange(size) {
	var vec = Vector.empty();

	for (var i = 0; size > i; i++) {
		vec = vec.append(i, vec);
	}
	return vec;
}



var lists = {
	fb: Immutable.Range(0, 1024)
	, mr: mori.range(0, 1024)
	, eg: eRange(1024)
	, cs: cRange(1024)
	, nt: Array.apply(0, new Array(1024)).map((_, index) => index)

	, fb2: Immutable.Range(0, 32768)
	, mr2: mori.range(0, 32768)
	, eg2: eRange(32768)
	, cs2: cRange(32768)
	, nt2: Array.apply(0, new Array(32768)).map((_, index) => index)
};



describe('append/push comparisons', function() {

	// = 1024 ============================

	it('immutable-js take', function() {
		var x = lists.fb.take(lists.fb.size / 2)
	})

	it('mori take', function() {
			var x = mori.take(mori.count(lists.mr), lists.mr)
	})

	it('eagle take', function() {
		var x = lists.eg.take(lists.eg.length / 2, lists.eg)
	})

	it('cassowry take', function() {
		var x = Cassowry.take(lists.cs.length / 2, lists.cs)
	})

	it('native slice', function() {
		var x = lists.nt.slice(0, lists.nt.length / 2)
	})

	// = 32768 ============================

	it('immutable-js take 32768', function() {
		var x = lists.fb2.take(lists.fb2.size / 2)
	})

	it('mori take 32768', function() {
		var x = mori.take(mori.count(lists.mr2), lists.mr2)
	})

	it('eagle take 32768', function() {
		var x = lists.eg2.take(lists.eg2.length / 2, lists.eg2)
	})

	it('cassowry take 32768', function() {
		var x = Cassowry.take(lists.cs2.length / 2, lists.cs2)
	})

	it('native slice 32768', function() {
		var x = lists.nt2.slice(0, lists.nt2.length / 2)
	})

});