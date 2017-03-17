import {empty as _empty, of as _one} from './cassowry/constructors';
import {append} from './cassowry/append'

// a demo only(cassowry is BYO base class) example how to setup a class with cassowry's traits

function Vector(len) {
	this.length = len;
}

function create(len) {
	return new Vector(len);
}

export function of(value, ...rest) {
	var vec = _one(value, create);
	
	for (var value of rest) {
		vec = vec.append()
	}
}

export function empty() {
	return _empty(create)
}


Vector.prototype.append = function(value) {
	return append(value, this, create)
};