
// type LinkedList<T> = {
// 	value: T
// 	link: LinkedList<T>,
// }
//
//
// export type Node<T> = Array<Array<T | Node<T> | number>>
//
// export type Vector<T> = {
// 	length: number,
// 	depth: 1|2|3|4|5|6,
// 	pre: ?LinkedList<T>,
// 	aft: Array<T>,
// 	root: ?Node<T>,
// 	empty: function:Vector
// }

function Vector(len) {
	this.length = len;
	this.root = null; // the tree structure
	this.pre = null;  // transient front of list, optimized for fast prepends only(singly linked list)
	this.aft = [];    // transient tail of list, optimized for fast appends only  (native array)
}

export const CtorTrait = {
	empty() {
		var vec = new Vector(0);

		// todo: need to evaluate options to optimize calc for length of tail
		// e.g. clojure uses (length < 32 ? 0 : ((length - 1) >>> 5) << 5

		// option 1: store length of tree on root. tailLen == length - treeLen
		//           extra work on tree updates, but we're doing that already...
		// option 2: cache tail len. update on push.
		//           cheap, but affects push() performance
		// option 3: only store chunks of 32 in tree, remainder must always be pre or aft
		//           have to allow tail to be > 32 but < 64, but might may be acceptable?
		//
		// goal is to be able to push directly to tail(mutate)


		return vec;
	},

	of(...values) {
		if (values.length > 32) {
			//blow up or something
		}
		var vec = new Vector(values.length);
		vec.aft = values;
		return vec;
	},

	clone(list: Vector) {
		var vec = new Vector(list.length);
		vec.root = list.root;
		vec.pre = list.pre;
		vec.aft = list.aft;

		return vec;
	}
};