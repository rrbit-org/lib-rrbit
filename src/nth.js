import {TreeTrait} from './shared/tree';


export var NthTrait = {
	...TreeTrait,
	/**
	 * a public 'get' method
	 *
	 * @param {number} index
	 * @param {Vector<T>} list
	 * @param  notFound - value to yield if index is out of bounds. useful for wrapping
	 *                    your platform's preferred error handling scheme
	 * @return {T|notFound}
	 */
	nth(index, list, notFound) {
		var {focusStart, focusEnd, focus, length} = list;

		if (index < 0)
			index += length;

		if (index < 0 || length < index) { // index is in the vector bounds
			return notFound
		}

		// index is in focused subtree
		if (focusStart <= index && index < focusEnd) {
			var indexInFocus = index - focusStart;
			return this._getElemInFocus(indexInFocus, indexInFocus ^ focus, list, notFound);
		}

		if (list.transient) {
			this.normalize(list.depth, list);
			list.transient = false
		}
		return this._getElementFromRoot(index, list)
	},

	_getElemInFocus(index, xor, list, notFound){

		if (xor < 32) return this._getElemD(1, index, list.display0);
		if (xor < 1024) return this._getElemD(2, index, list.display1);
		if (xor < 32768) return this._getElemD(3, index, list.display2);
		if (xor < 1048576) return this._getElemD(4, index, list.display3);
		if (xor < 33554432) return this._getElemD(5, index, list.display4);
		if (xor < 1073741824) return this._getElemD(6, index, list.display5);

		// ideally we should be throwing an error here as anything this high
		// is ALWAYS out of bounds. but v8 is much less performing when it detects an error case
		return notFound;
	},


	_getElementFromRoot(index, list) {
		var depth = list.depth;
		var display = list["display" + (depth - 1)];

		//when in relaxed mode, we may have to offset the index a little
		//to find the branch our value lives in
		var sizes = display[display.length - 1];
		do {
			var sizesIdx = this.getIndexInSizes(sizes, index);
			if (sizesIdx != 0)
				index -= sizes[sizesIdx - 1];
			display = display[sizesIdx];
			if (depth > 2)
				sizes = display[display.length - 1];
			else
				sizes = null;
			depth -= 1;
		} while (sizes != null);

		return this._getElemD(depth, index, display);
	},

	_getElemD(depth, i, display) {
		switch (depth) {
			case 6:
				return display[(i >> 25) & 31][(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
			case 5:
				return display[(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
			case 4:
				return display[(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
			case 3:
				return display[(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
			case 2:
				return display[(i >> 5) & 31][(i & 31)];
			case 1:
				return display[(i & 31)]
		}
	}

};