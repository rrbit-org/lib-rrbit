import {setupAsClass} from '../shared/constructors'

export var DEPTHS = [
	32, // 0 depth (leaf only)
	1024, // 1 depth (default min depth)
	32768, // 2 depth
	1048576, // 3 depth (1M)
	33554432, // 4 depth (33.5M)
	1073741824 // 5 depth (1B) usually will cause out-of-memory by this point in current JS engines
];

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