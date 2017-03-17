import {append, appendǃ} from './eagle/append';
import {prepend} from './eagle/prepend';
import {drop} from './eagle/drop'
import {take} from './eagle/take'
import {iterator} from './eagle/iterator'
import {nth} from './eagle/nth'
import {appendAll} from './eagle/appendAll'
import {update} from './eagle/update'
import {empty as emptyMixin, of as oneMixin} from './eagle/shared/constructors'

// example BYO class implementation. not meant for actual use
function Vector(size) {
	this.length = size || 0;
}

function create(len) {
	return new Vector(len);
}

export function empty() {
	return emptyMixin(create)
}

export function of(first, ...rest) {
	var vec = oneMixin(first, create);
	for (var value of rest) {
		vec = vec.append(value);
	}
	return vec;
}

var proto = Vector.prototype;

// attach helpers to prototype to avoid closure perf loss

proto._factory = create; 

proto._prepend = prepend;
proto.prepend = function(value) {
	this._prepend(value, this, this._factory)
};

proto._append = append;
proto.append = function(value) {
	return this._append(value, this, this._factory);
};

proto._drop = drop;
proto.drop = function(n) {
	return this._drop(n, this, this._factory);
};

proto._take = take;
proto.take = function(n) {
	return this._take(n, this, this._factory);
};

proto._nth = nth;
proto.get = function(i, notFound) {
	return this._nth(i, this, notFound);
};

proto._appendAll = appendAll;
proto.concat = function(rrb) {
	return this._appendAll(this, rrb, this._factory);
};

proto._update = update;
proto.set = function(i, value) {
	return this._update(i, value, this._factory)
};

proto._iterator = iterator;
proto[Symbol.iterator] = function() {
	return this._iterator(0, this.length, this);
};