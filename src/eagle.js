import {append, appendǃ} from './eagle/append';
import {prepend} from './eagle/prepend';
import {drop} from './eagle/drop'
import {take} from './eagle/take'
import {iterator} from './eagle/iterator'
import {nth} from './eagle/nth'
import {appendAll} from './eagle/appendAll'
import {update} from './eagle/update'

// example BYO class implementation
function Vector(size) {
	this.length = size || 0;
}

function create(len) {
	return new Vector(len);
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