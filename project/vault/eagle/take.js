import {CtorTrait} from './shared/constructors';
import {TreeTrait} from './shared/tree';


export var TakeTrait = {
	...CtorTrait,
	...TreeTrait,
	/**
	 * keep first n items dropping the tail
	 *
	 * @param {number} n
	 * @param {Vector} rrb
	 * @return {Vector}
	 */
	take(n, rrb) {
		if (0 >= n) {
			return this.empty();
		}
		if (n >= rrb.length) {
			return rrb;
		}

		if (rrb.transient) {
			this.normalize(rrb.depth, rrb);
			rrb.transient = false
		}


		var vec = this.fromFocusOf(rrb);
		vec.length = n;
		vec.focusEnd = n;

		if (rrb.depth > 1) {
			this.focusOn(n - 1, vec);
			var focusInblock = (vec.focus & 31) + 1;
			if (focusInblock != 32) {
				vec.display0 = vec.display0.slice(0, focusInblock);
			}

			var cutIndex = vec.focus | vec.focusRelax;
			this._cleanTopTake(cutIndex, vec);
			vec.focusDepth = Math.min(vec.depth, vec.focusDepth);

			if (!(vec.depth > 1))
				return vec;

			this.copyDisplays(vec.focusDepth, cutIndex, vec);
			var i = vec.depth;
			var offset = 0;
			while (i > vec.focusDepth) {
				var display = vec['display' + (i + 1)];

				var oldSizes = display[display.length - 1];
				var newLen = ((vec.focusRelax >> (5 * (i - 1))) & 31) + 1;
				var newSizes = new Array(newLen);
				this.arraycopy(oldSizes, 0, newSizes, 0, newLen - 1);
				newSizes[newLen - 1] = n - offset;
				if (newLen > 1)
					offset += newSizes[newLen - 2];

				var newDisplay = new Array(newLen + 1);
				this.arraycopy(display, 0, newDisplay, 0, newLen);
				newDisplay[newLen - 1] = null;
				newDisplay[newLen] = newSizes;
				switch (i) {
					case 2 :
						vec.display1 = newDisplay;
					case 3 :
						vec.display2 = newDisplay;
					case 4 :
						vec.display3 = newDisplay;
					case 5 :
						vec.display4 = newDisplay;
					case 6 :
						vec.display5 = newDisplay;
				}
				i -= 1
			}
			this.stabilizeDisplayPath(vec.depth, cutIndex, vec);


		} else if (/* depth==1 && */ n != 32) {
			vec.display0 = vec.display0.slice(0, n);
			vec.focus = 0;
			vec.focusStart = 0;
			vec.focusDepth = 1;
			vec.focusRelax = 0;
		}
		return vec
	},


	_cleanTopTake(cutIndex, rrb){
		var newDepth = 0;

		var {depth} = rrb;
		if (depth == 1)
			return;

		if (depth < 6 || cutIndex < 33554432) {
			rrb.display5 = null;
			if (depth < 5 || cutIndex < 1048576) {
				rrb.display4 = null;
				if (depth < 4 || cutIndex < 32768) {
					rrb.display3 = null;
					if (depth < 3 || cutIndex < 1024) {
						rrb.display2 = null;
						if (cutIndex < 32) {
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

		rrb.depth = newDepth
	}
};