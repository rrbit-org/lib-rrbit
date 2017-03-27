import {AppendTrait} from './append';
import {AppendAllTrait} from './appendAll';
import {NthTrait} from './nth';
import {DropTrait} from './drop';
import {TakeTrait} from './take';
import {PrependTrait} from './prepend';
import {UpdateTrait} from './update';
import {iterator, reverseIterator} from './iterator';

/**
 *
 * @param {function(number): Vector} factory - your class factory(must return any object with a 'length' property)
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

	'nth drop take update prepend append appendǃ appendAll'
		.split(' ')
		.forEach(name => lib[name] = lib[name].bind(lib));

	return lib;
}