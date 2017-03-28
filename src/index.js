import {AppendTrait} from './append';
import {AppendAllTrait} from './appendAll';
import {NthTrait} from './nth';
import {DropTrait} from './drop';
import {TakeTrait} from './take';
import {PrependTrait} from './prepend';
import {UpdateTrait} from './update';
import {iterator, reverseIterator} from './iterator';

/**
 * @type VectorApi
 * @property {function(number, Vector): Vector} VectorApi.take
 * @property {function(number, Vector): Vector} VectorApi.drop
 * @property {function(number, Vector, *): Vector} VectorApi.nth
 * @property {function(number, T, Vector<T>): Vector<T>} VectorApi.update
 * @property {function(number, T, Vector<T>): Vector<T>} VectorApi.prepend
 * @property {function(number, T, Vector<T>): Vector<T>} VectorApi.append
 * @property {function(number, T, Vector<T>): Vector<T>} VectorApi.appendǃ
 * @property {function(Vector, Vector): Vector} VectorApi.appendAll
 * @property {function(): Vector} VectorApi.empty
 * @property {function(number, number, Vector): Iterator} VectorApi.iterator
 * @property {function(number, number, Vector): Iterator} VectorApi.reverseIterator
 */

/**
 *
 * @param {function(number): Vector} factory - your class factory(must return any object with a 'length' property)
 * @return {VectorApi}
 */
export function setup(factory) {
	var lib = {
		iterator,
		reverseIterator,
		...DropTrait,
		...TakeTrait,
		...NthTrait,
		...UpdateTrait,
		...PrependTrait,
		...AppendTrait,
		...AppendAllTrait,
		factory
	};

	var VectorApi = {};

	'nth drop take update prepend append appendǃ appendAll empty iterator reverseIterator'
		.split(' ')
		.forEach(name =>
			lib[name] = VectorApi[name].bind(lib));

	return VectorApi;
}