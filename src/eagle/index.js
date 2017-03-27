// import {} from './shared/constructors';
import {AppendTrait} from './append';
import {AppendAllTrait} from './appendAll';
import {AppendAllTrait} from './nth';
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
		factory,
		iterator,
		reverseIterator
	};


	Object.assign(lib, DropTrait);
	Object.assign(lib, TakeTrait);
	Object.assign(lib, UpdateTrait);
	Object.assign(lib, PrependTrait);
	Object.assign(lib, AppendTrait);
	Object.assign(lib, AppendAllTrait);

	var publicMethods = 'drop take update prepend append appendǃ appendAll'.split(' ');
	for (var name in publicMethods) {
		lib[name] = lib[name].bind(lib);
	}

	return lib;
}