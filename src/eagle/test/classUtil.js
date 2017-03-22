import {setupAsClass} from '../shared/constructors'


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