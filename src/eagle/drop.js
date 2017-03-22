import {CtorTrait} from './shared/constructors';
import {TreeTrait} from './shared/tree';


export var DropTrait = {
	...CtorTrait,
	...TreeTrait,
	/**
	 * drop first n items keeping the tail
	 *
	 * @param {number} n
	 * @param {Vector} rrb
	 * @return {Vector}
	 */
	drop(n, rrb) {
		if (n <= 0)
			return rrb;

		if (n >= rrb.length)
			return this.empty();

		if (rrb.transient) {
			this.normalize(rrb.depth, rrb);
			rrb.transient = false
		}

		var vec = this.fromFocusOf(rrb);
		vec.length = rrb.length - n;
		if (vec.depth > 1) {
			this.focusOn(n, vec);
			var cutIndex = vec.focus | vec.focusRelax;
			var d0Start = cutIndex & 31;
			if (d0Start != 0) {
				var d0len = vec.display0.length - d0Start;
				vec.display0 = this.arraycopy(vec.display0, d0Start, new Array(d0len), 0, d0len)
			}

			this._cleanTopDrop(cutIndex, vec);
			if (vec.depth > 1) {
				var i = 2;
				var display = vec.display1;
				while (i <= vec.depth) {
					var splitStart = (cutIndex >> (5 * (i - 1))) & 31;
					var newLen = display.length - splitStart - 1;
					var newDisplay = this.arraycopy(display, splitStart + 1, new Array(newLen + 1), 1, newLen - 1);

					if (i > 1) {
						newDisplay[0] = vec['display' + (i - 2)];
						vec['display' + (i - 1)] = this.withComputedSizes(newDisplay, i);
						if (display < 6)
							display = vec['display' + i]
					}

					i += 1
				}
			}

			vec.focusEnd = vec.display0.length;
		} else {
			var newLen = vec.display0.length - n;
			vec.focusEnd = newLen;
			vec.display0 = this.arraycopy(vec.display0, n, new Array(newLen), 0, newLen);
		}

		vec.focus = 0;
		vec.focusStart = 0;
		vec.focusDepth = 1;
		vec.focusRelax = 0;
		return vec
	},


// adjust focus and depth to match new length
	_cleanTopDrop(cutIndex, rrb) {
		var newDepth = 0;

		var {
			depth,
			//display0,
			display1,
			display2,
			display3,
			display4,
			display5
		} = rrb;

		if (depth == 1)
			return;

		if (depth < 6 || (cutIndex >> 25) == display5.length - 2) {
			rrb.display5 = null;
			if (depth < 5 || (cutIndex >> 20) == display4.length - 2) {
				rrb.display4 = null;
				if (depth < 4 || (cutIndex >> 15) == display3.length - 2) {
					rrb.display3 = null;
					if (depth < 3 || (cutIndex >> 10) == display2.length - 2) {
						rrb.display2 = null;
						if ((cutIndex >> 5) == display1.length - 2) {
							rrb.display1 = null;
							newDepth = 1
						} else
							newDepth = 2
					} else
						newDepth = 3
				} else
					newDepth = 4
			} else
				newDepth = 5
		} else
			newDepth = 6;

		rrb.depth = newDepth;
	}

};