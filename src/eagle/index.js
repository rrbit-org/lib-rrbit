import {mixin as mixinCtor} from './shared/constructors';
import {mixin as mixinApp} from './append';
// import {nth} from '../nth';

function Vector(len) {
	this.length = len;
}

function create(len) {
	return new Vector(len)
}

mixinCtor(Vector);
mixinCtor(Vector.prototype);
mixinApp(Vector.prototype);

Vector.make = create;
Vector.prototype.make = create;
Vector.empty = Vector.prototype.empty;

Vector.prototype.append = function(value) {
	return this['☠rrbit/append'](value, this)
};

export {Vector};