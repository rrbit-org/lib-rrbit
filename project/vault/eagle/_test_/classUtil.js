import {setupAsClass} from '../shared/constructors'

export var DEPTHS = [
	32, // 0 depth (leaf only) (32 ** 1)
	1024, // 1 depth (default min depth) (32 ** 2)
	32768, // 2 depth (32 ** 3)
	1048576, // 3 depth (1M) (32 ** 4)
	33554432, // 4 depth (33.5M) (32 ** 5)
	1073741824 // 5 depth (1B) (32 ** 6) usually will cause out-of-memory by this point in current JS engines
];

function depthOfIndex(index) {
	return Math.floor(Math.log(index) / Math.log(32))
}

export function createClass(...traits) {

	function Vector(len)
	{
		this.length = len;
	}

	function factory(len)
	{
		return new Vector(len);
	}



	for (var trait of traits) {
		extend(Vector.prototype, trait)
	}

	setupAsClass(Vector, factory);

	return Vector;
}

function extend(base, mixin) {
	for (var key in mixin) {
		base[key] = mixin[key]
	}
}