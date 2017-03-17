import {empty, fromFocusOf} from './shared/constructors';
import {
	focusOnLastBlockǃ,
	makeTransientIfNeeded,
	makeTransientSizes,
	setupNewBlockInNextBranch} from './shared/tree';
import {arraycopy} from './shared/array';



/**
 * append one value to end of list, returning a new list
 *
 * @param {T} value
 * @param {Vector<T>} list
 * @param {function(number):Vector<T>} factory
 * @return {Vector<T>}
 */
export function append(value, list, factory) {
	if (list.length === 0) {
		var vec = empty(factory);
		vec.length = 1;
		vec.focusEnd = 1;
		vec.display0 = [value];
		return vec;
	}

	var vec = fromFocusOf(list, factory);
	vec.transient = list.transient;
	vec.length = list.length + 1



	focusOnLastBlockǃ(list.length, vec);

	var elemIndexInBlock = (list.length - vec.focusStart) & 31;
	if  (elemIndexInBlock === 0) {
		// next element will go in a new block position
		appendBackNewBlock(value, list.length, vec)
	} else {
		// if next element will go in current block position
		appendOnCurrentBlock(value, elemIndexInBlock, vec)
	}


	return vec;
}

/**
 * mutable append
 *
 * a more performant version meant for use in builders or private loops
 *
 * @param value
 * @param list
 * @return {*}
 */
export function appendǃ(value, list) {
	if (list.length === 0) {
		list.length = 1;
		list.display0 = [value];
		return list;
	}

	list.length += 1

	focusOnLastBlockǃ(list.length, list);

	var elemIndexInBlock = (list.length - list.focusStart) & 31;
	if  (elemIndexInBlock === 0) {
		// next element will go in a new block position
		appendBackNewBlock(value, list.length, list)
	} else {
		// if next element will go in current focused block
		list.focusEnd = list.length;
		list.display0[elemIndexInBlock] = value;
		makeTransientIfNeeded(list)
	}

	return list;
}


function appendOnCurrentBlock(value, elemIndexInBlock, list) {

	list.focusEnd = list.length;
	var d0 = list.display0.slice(0);
	d0[elemIndexInBlock] = value;
	list.display0 = d0
	makeTransientIfNeeded(list)
}

export function appendBackNewBlock(elem, _length, list) {
	var oldDepth = list.depth
	var newRelaxedIndex = _length - list.focusStart + list.focusRelax;
	var focusJoined = list.focus | list.focusRelax
	var xor = newRelaxedIndex ^ focusJoined

	setupNewBlockInNextBranch(xor, list.transient, list);

	// setupNewBlockInNextBranch(...) increased the depth of the tree
	if (oldDepth == list.depth) {
		var i = xor < 1024 ? 2 :
			(xor < 32768 ? 3 :
				(xor < 1048576 ? 4 :
					(xor < 33554432 ? 5 :
						6)));

		if (i < oldDepth) {
			var _focusDepth = list.focusDepth
			var display = list['display' + i];
			do {
				var displayLen = display.length - 1
				var oldSizes = display[displayLen]
				var newSizes = (i >= _focusDepth && oldSizes != null) ?
					makeTransientSizes(oldSizes, displayLen - 1)
					: null;

				var newDisplay = new Array(display.length)
				arraycopy(display, 0, newDisplay, 0, displayLen - 1)
				if (i >= _focusDepth)
					newDisplay[displayLen] = newSizes

				switch (i) {
					case 2 :
						list.display2 = newDisplay
						display = list.display3;
						break;
					case 3 :
						list.display3 = newDisplay
						display = list.display4;
						break;
					case 4 :
						list.display4 = newDisplay
						display = list.display5;
						break;
					case 5 :
						list.display5 = newDisplay
				}
				i += 1
			} while (i < oldDepth)
		}
	}

	if (oldDepth == list.focusDepth) {
		list.focus = _length;
		list.focusStart = 0;
		list.focusDepth = list.depth;
		list.focusRelax = 0;

	} else {
		list.focus = 0;
		list.focusStart = _length;
		list.focusDepth = 1;
		list.focusRelax = newRelaxedIndex & -32;
	}
	list.focusEnd = _length + 1;
	list.display0[0] = elem
	list.transient = true;
}