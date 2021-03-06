import {CtorTrait} from './shared/constructors';
import {TreeTrait} from './shared/tree';

export var PrependTrait = {
	...CtorTrait,
	...TreeTrait,

	/**
	 *
	 * @param {T} value
	 * @param {Vector<T>} list
	 * @return {Vector<T>}
	 */
	prepend(value, list) {

		if (list.length === 0) {
			var vec = this.empty();
			vec.length = 1;
			vec.display0 = [value];
			return vec;
		}

		var vec = this.fromFocusOf(list);
		vec.length = list.length;
		vec.transient = list.transient;
		vec.length = list.length + 1;

		this.focusOnFirstBlock(vec);
		if (list.display0.length < 32) { // element fits in current block
			this._prependOnCurrentBlock(value, vec)
		} else {
			this._prependFrontNewBlock(value, vec)
		}

		return vec
	},

	_prependOnCurrentBlock(value, list) {
		var oldD0 = list.display0;
		var newLen = oldD0.length + 1;
		list.focusEnd = newLen;

		var d0 = new Array(newLen);
		d0[0] = value;
		for (var i = 0, l = oldD0.length; l > i; i++) {
			d0[i + 1] = oldD0[i];
		}

		list.display0 = d0;
		this.makeTransientIfNeeded(list);
	},

	_prependFrontNewBlock(elem, list) {

		var currentDepth = Math.max(list.focusDepth, 2)


		var display = list['display' + (currentDepth - 1)];

		while (display != null && display.length == 33) { /* the insertion depth has not been found */
			currentDepth += 1;
			switch (currentDepth) {
				case 2 : display = list.display1; break;
				case 3 : display = list.display2; break;
				case 4 : display = list.display3; break;
				case 5 : display = list.display4; break;
				case 6 : display = list.display5; break;
			}
		}

		var oldDepth = list.depth

		// create new node at this depth and all singleton nodes under it on left most branch
		this.setupNewBlockInInitBranch(currentDepth, list.transient, list)

		// update sizes of nodes above the insertion depth
		if (oldDepth == list.depth) { // setupNewBlockInNextBranch(...) increased the depth of the tree
			var i = currentDepth
			if (i < oldDepth) {
				var _focusDepth = list.focusDepth
				display = list['display' + i]
				do {
					var displayLen = display.length - 1
					var newSizes = i >= _focusDepth ? this.makeTransientSizes(display[displayLen], 1) : null

					var newDisplay = new Array(display.length)
					this.arraycopy(display, 1, newDisplay, 1, displayLen - 1)
					if (i >= _focusDepth)
						newDisplay[displayLen] = newSizes

					switch (i) {
						case 2:
							list.display2 = newDisplay
							display = list.display3;
							break;
						case 3:
							list.display3 = newDisplay
							display = list.display4;
							break;
						case 4:
							list.display4 = newDisplay
							display = list.display5
							break;
						case 5:
							list.display5 = newDisplay
							break;
					}
					i += 1
				} while (i < oldDepth)
			}
		}

		list.focus = 0;
		list.focusStart = 0;
		list.focusEnd = 1;
		list.focusDepth = 1;
		list.focusRelax = 0;
		list.display0[0] = elem;
		list.transient = true;
		return list;
	}
};



