import {CtorTrait} from './shared/constructors';
import {TreeTrait} from './shared/tree';

export var UpdateTrait = {
	...CtorTrait,
	...TreeTrait,

	/**
	 *
	 * @param {number} i
	 * @param {T} value
	 * @param {Vector<T>} rrb
	 * @param {*} notFound
	 * @return {Node<T>|notFound}
	 */
	update(i, value, rrb, notFound) {
		var vec = this.fromFocusOf(rrb);
		vec.transient = rrb.transient;
		vec.length = rrb.length;

		if (i < rrb.focusStart || rrb.focusEnd <= i || ((i - rrb.focusStart) & ~31) != (rrb.focus & ~31)) {
			if (i < 0 || rrb.length <= i)
				return notFound;

			this.normalizeAndFocusOn(i, vec)
		}
		//make transient if needed
		if (vec.depth > 1 && !vec.transient) {
			this.copyDisplaysAndNullFocusedBranch(vec.depth, vec.focus | vec.focusRelax, vec);

			vec.transient = true
		}
		var d0 = vec.display0.slice(0);
		d0[(i - vec.focusStart) & 31] = value;
		vec.display0 = d0;
		return vec;
	}
};
