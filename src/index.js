var iterator;

// the default base class, mostly here to make testing easier
function Vector(len) {
	this.length = len || 0;
	this.root = null; // the tree structure
	this.pre = null;  // transient front of list, optimized for fast prepends only(singly linked list)
	this.aft = null;    // transient tail of list, optimized for fast appends only  (native array)
}

Vector.prototype[Symbol.iterator] = function() {
	return iterator(this, 0, this.length);
}

function CancelToken(value, index) {
	this.value = value;
	this.index = index;
}
CancelToken.prototype = Object.create(Error.prototype);
CancelToken.prototype.constructor = CancelToken;
CancelToken.prototype.isCancelToken = true; // cheaper instanceof check


function Finder(predicate) {
	this.predicate = predicate;
}
Finder.prototype.Found = CancelToken;
Finder.prototype.NotFound = new CancelToken(null, -1);
Finder.prototype.step = function(_, value, index) {
	return this.predicate(value) ? new this.Found(value, index) : this.NotFound
}
Finder.prototype.toReducer = function() {
	return this.step.bind(this)
}


export function setup(factory) {
	var lib = {
		...Cassowry,
		factory: factory || Cassowry.factory
	};

	var VectorApi = [
		'nth',
		'drop',
		'take',
		'update',
		'prepend',
		'append',
		'appendǃ',
		'appendAll',
		'empty',
		'reduce',
		'reduceRight',
		'find'
		// 'iterator',
		// 'reverseIterator'
	].reduce((api, name) => {
		api[name] = lib[name].bind(lib);
		return api;
	}, {});

	return VectorApi;
}

export const Cassowry = {
	// = config ===========================================================

	OCCULANCE_ENABLE: true,


	// = factory ===========================================================

	Vector,
	factory() {
		return new this.Vector();
	},
	clone(list) {
		var vec = this.factory();
		vec.length = list.length;
		vec.root = list.root;
		vec.pre = list.pre;
		vec.aft = list.aft;
		if (list.originOffset)
			vec.originOffset = list.originOffset

		return vec;
	},

// enable v8 to optimize by hiding Errors from happy path
	IllegalRange(msg) {
		throw new RangeError(msg || 'out of range')
	},

	// = Cancel token ===========================================================

	CancelToken,
	isCancelled(value) {
		return value && value.isCancelToken
	},
	done(value, index) {
		return new this.CancelToken(value, index)
	},
	cancel(value, index) {
		throw new this.CancelToken(value, index);
	},
	doCancelable(fn) {
		// try/catches are a major de-opt. so we extract that out to enable everything
		// else to optimize and inline as much as possible
		try {
			return fn()
		} catch (e) {
			if (this.isCancelled(e)) {
				return e;
			} else {
				throw e;
			}
		}
	},

	// = linked list helpers ===========================================================

	// optimize for prepend performance
	SinglyLinkedList(data, len, next) {
		this.data = data;
		this.link = next;
		this.length = len;
	},

	addLL(value, list) {
		if (list) {
			return new this.SinglyLinkedList(value, list.length + 1, list)
		}
		return new this.SinglyLinkedList(value, 1, list)
	},
	llToArray(ll) {
	 	if (!ll) return new Array(0);
	 	
	 	var result = new Array(ll.length);
	 	var i = 0;
	 	while(ll) {
	 		result[i] = ll.data;
	 		ll = ll.link;
	 		i += 1
		}
		return result;
	},
	arrayToLL: function(arr) {
		var list = null;
		for (var i = arr.length - 1; i >= 0; i--) {
			list = this.addLL(arr[i], list);
		}
		return list;
	},

	// = immutable array helpers =======================================================
	aPush(value, arr) {
		var len = arr.length;
		var result = new Array(len + 1);

		for (var i = 0; i < len; i++) {
			result[i] = arr[i]
		}

		result[len] = value;
		return result;
	},
	aUnshift(value, arr) {
		var len = arr.length;
		var result = new Array(len + 1);

		for (var i = 0; i < len; i++) {
			result[i + 1] = arr[i]
		}

		result[0] = value;
		return result;
	},
	aSet(index, value, arr) {
		var len = arr.length;
		var result = new Array(len);
		for (var i = 0; i < len; i++) {
			result[i] = arr[i]
		}
		result[index] = value;
		return result;
	},
	aSetǃ(index, value, arr) {
		arr[index] = value;
		return arr
	},
	aSetAsLast(index, value, src) {
		if (!src)
			return [value];

		var result = this.aSlice(0, index, src);
		result[index] = value;
		return result
	},
	aSlice(from, to, arr) {
		var len = to - from;
		var result = new Array(len);
		for (var i = 0; len > i; i++) {
			result[i] = arr[i + from]
		}
		return result;
	},

	// = tree math helpers =======================================================

	/**
	 * code here for education only(don't use), this is faster when inlined
	 *
	 * we use this to get to the nearest block of 32. basically equivalent to:
	 *
	 * Math.floor( length / 32) * 32
	 *
	 * @param {number} length
	 * @return {number}
	 */
	tailOffset(length) {
		return (length >>> 5) << 5
	},
	/**
	 * code here for education only(don't use), this is faster when inlined
	 *
	 * we use this to get the index is the current block. basically equivalent to:
	 *
	 * length % 32
	 *
	 * @param {number} length
	 * @return {number}
	 */
	tailIndex(index) {
		return index & 31
	},
	/**
	 * code here for education only(don't use), this is faster when inlined
	 *
	 * we use this to get the index is the current block, for parent nodes. basically equivalent to:
	 *
	 * var depth = Math.floor(Math.log(length) / Math.log(32))  //logBase length
	 * Math.floor( length / Math.pow(32, depth)) * Math.pow(32, depth)
	 *
	 * @param {number} length
	 * @return {number}
	 */
	indexInBlockAtDepth(index, depth) {
		return (index >>> (depth * 5)) & 31
	},

	// faster than doing:
	// Math.floor(Math.log(len) / Math.log(32))

	// return function(len) {
	// 	return ((31 - (31 - ((Math.log(len >>> 0) * Math.LOG2E) |0))) / 5) | 0
	// }

	// if (typeof Math.clz32 === 'function' && !isNode) {
	// 	//for some reason this works terrible in node, but great in browsers
	// 	return function(len) {
	// 		return ((31 - Math.clz32(len - 1)) / 5) | 0
	// 	}
	// }
	// return function(len) {
	// 	len--
	// 	// 0000000000000000000000000100000 // 32
	// 	// 0000000000000000000010000000000 // 1024
	// 	// 0000000000000001000000000000000 // 32768
	// 	// 0000000000100000000000000000000 // 1048576
	// 	// 0000010000000000000000000000000 // 33554432
	// 	// 1000000000000000000000000000000 // 1073741824
	// 	return 0 + !!(len >>> 30) + !!(len >>> 25) + !!(len >>> 20) + !!(len >>> 15) + !!(len >>> 10) + 1 //!!(len >>> 5)
	// }
	depthFromLength: function(len) {
		if (len <= 1024) return 1;
		if (len <= 32768) return 2;
		if (len <= 1048576) return 3;
		if (len <= 33554432) return 4;
		if (len <= 1073741824) return 5;
		return 6;
	},

	/*
	 * optimization strategy here is a form of loop unrolling, where instead
	 * of looping all the way down to child-most node, we use a switch case
	 * specific to depth of tree.
	 */
	appendLeafOntoTree(leaf, tree, i) {
		var   d1
			, d2
			, d3
			, d4
			, d5
			, n1
			, n2
			, n3
			, n4
			, n5


		if (!tree) { // Math.pow(32, 1)
			return [leaf]
		}

		if (i < 1024) { // Math.pow(32, 2)
			
			return this.aSetAsLast((i >>> 5) & 31, leaf, tree)
		}

		if (i < 32768) { // Math.pow(32, 3)
			if (i == 1024) {
				tree = [tree]
			}
			d2 = tree
			d1 = d2[(i >>> 10) & 31]
			n1 = this.aSetAsLast((i >>> 5 ) & 31, leaf, d1)
			n2 = this.aSetAsLast((i >>> 10) & 31, n1, d2)
			return n2;
		}

		if (i < 1048576) {// Math.pow(32, 4)
			if (i == 32768) {
				tree = [tree]
			}
			d3 = tree
			d2 = d3[(i >>> 15) & 31]
			d1 = d2 && d2[(i >>> 10) & 31]
			n1 = this.aSetAsLast((i >>> 5 ) & 31, leaf, d1)
			n2 = this.aSetAsLast((i >>> 10) & 31, n1, d2)
			n3 = this.aSetAsLast((i >>> 15) & 31, n2, d3)
			return n3;
		}

		if (i < 33554432) {// Math.pow(32, 5)
			if (i == 1048576) {
				tree = [tree]
			}
			d4 = tree
			d3 = d4[(i >>> 20) & 31]
			d2 = d3 && d3[(i >>> 15) & 31]
			d1 = d2 && d2[(i >>> 10) & 31]
			n1 = this.aSetAsLast((i >>> 5 ) & 31, leaf, d1)
			n2 = this.aSetAsLast((i >>> 10) & 31, n1, d2)
			n3 = this.aSetAsLast((i >>> 15) & 31, n2, d3)
			n4 = this.aSetAsLast((i >>> 20) & 31, n2, d4)
			return n4;
		}

		if (i < 1073741824) { // Math.pow(32, 6)
			if (i == 33554432) {
				tree = [tree]
			}
			d5 = tree
			d4 = d5[(i >>> 20) & 31]
			d3 = d4 && d4[(i >>> 20) & 31]
			d2 = d3 && d3[(i >>> 15) & 31]
			d1 = d2 && d2[(i >>> 10) & 31]
			n1 = this.aSetAsLast((i >>> 5 ) & 31, leaf, d1)
			n2 = this.aSetAsLast((i >>> 10) & 31, n1, d2)
			n3 = this.aSetAsLast((i >>> 15) & 31, n2, d3)
			n4 = this.aSetAsLast((i >>> 20) & 31, n2, d4)
			n5 = this.aSetAsLast((i >>> 25) & 31, n2, d5)
			return n5;
		}
	},
	appendLeafOntoTreeǃ(leaf, tree, i) {
		var d1, d2, d3, d4, d5;

		if (!tree) {
			return [leaf]
		}

		if (i < 1024) { // depth 1
			tree[(i >>> 5) & 31] = leaf
			return tree;
		}

		if (i < 32768) { // depth 2
			if (i == 1024) {
				tree = [tree]
			}
			d1 = tree[(i >>> 10) & 31] || (tree[(i >>> 10) & 31] = [])
			d1[(i >>> 5) & 31] = leaf
			return tree;
		}
		
		if (i < 1048576) { // depth 3
			if (i == 32768) {
				tree = [tree]
			}
			d3 = tree;
			d2 = d3[(i >>> 15) & 31] || (d3[(i >>> 15) & 31] = [])
			d1 = d2[(i >>> 10) & 31] || (d2[(i >>> 10) & 31] = [])
			d1[(i >>> 5) & 31] = leaf
			return tree;
		}
		
		if (i < 33554432) { // depth 4
			if (i == 1048576) {
				tree = [tree]
			}
			d4 = tree;
			d3 = d4[(i >>> 20) & 31] || (d4[(i >>> 20) & 31] = [])
			d2 = d3[(i >>> 15) & 31] || (d3[(i >>> 15) & 31] = [])
			d1 = d2[(i >>> 10) & 31] || (d2[(i >>> 10) & 31] = [])
			d1[(i >>> 5) & 31] = leaf
			return tree;
		}
		
		if (i < 1073741824) { // depth 5
			if (i == 33554432) {
				tree = [tree]
			}
			d5 = tree;
			d4 = d5[(i >>> 25) & 31] || (d5[(i >>> 25) & 31] = [])
			d3 = d4[(i >>> 20) & 31] || (d4[(i >>> 20) & 31] = [])
			d2 = d3[(i >>> 15) & 31] || (d3[(i >>> 15) & 31] = [])
			d1 = d2[(i >>> 10) & 31] || (d2[(i >>> 10) & 31] = [])
			d1[(i >>> 5) & 31] = leaf
			return tree;
		}

	},

	prependLeafOntoTree(leaf, list, treeLen) {
		var d1
			, d2
			, d3
			, d4
			, n1
			, n2
			, n3
			, n4
			, tree = list.root
			, offset = list.originOffset;

		if (!tree || treeLen == 0) {
			return [leaf]
		}

		// prepending has a few rules we try to follow:
		// 1) all of originOffset must be contained within the zero-eth top node index
		//    If the slot becomes fully packed, we know it's safe to unshift over by one and reset the originOffset
		//    in other words offset cannot be originOffset > (32 ** depth)
		//    note: drop() also needs to honor this
		//
		// 2) if a node is:(not the top node && within the originOffset), it must have a length of 32.
		//   The first elements will be null, but required for proper indexing
		//
		// 3) offset is calculated as an inverted tree from right to left
		//    so instead of prepending 32 and setting the offset to 32, we would set it to (32 ** depth) - 32
		//
		//                   [0][1]
		//                  /      \
		//                 /        \
		// [x][x][29][30][31]       [0][1][2]
		//        /   /   |         /   |   \
		//      /    /    |        /    |    \
		//    /     /     |       /     |     \
		//  [][][]-[][][]-[][][]-[][][]-[][][]-[][][]

		if (treeLen <= 1024) { // depth 1

			if (list.originOffset) {
				// hmm, shouldn't have an offset at this level?
			}
			if (treeLen == 1024) {
				list.originOffset = 1024 - 32;
				return [this.aSetǃ(31, leaf, new Array(32)), tree]
			}
			return this.aUnshift(leaf, tree);
		}

		if (treeLen <= 32768) { // depth 2
			// this.IllegalRange("can't prepend more than 1024...yet :(")
			if (treeLen == 32768) {// need to shift level up
				if (offset) {
					// if we had been only prepending, then offset would be 0 by now
					// we can only get here if drop'd first, then prepended
					// but drop is supposed to honor our indexing rules
					this.IllegalRange('error in drop(), failed to construct index correctly. please file a bug report')
				}

				list.originOffset = 32768 - 32;
				n1 = this.aSetǃ(31, leaf, new Array(32));
				n2 = this.aSetǃ(31, n1, new Array(32));
				return [n2, tree]
			}

			if (!offset) { // tree is fully left indexed, so we need to add a new offset'd node at zero
				list.originOffset = 1024 - 32;
				d1 = this.aSetǃ(31, leaf, new Array(32));
				return this.aUnshift(d1, tree)
			} else {
				list.originOffset = offset - 32;
				d1 = tree[0];
				n1 = this.aSet(((offset - 32) >> 5) & 31, leaf, d1);
				n2 = this.aSet(0, n1, tree);
				return n2;
			}
		}

		if (treeLen <= 1048576) { // depth 3

			if (treeLen == 1048576) {// need to shift level up
				if (offset) {
					this.IllegalRange('error in drop(), failed to construct index correctly. please file a bug report')
				}

				list.originOffset = 1048576 - 32;
				n1 = this.aSetǃ(31, leaf, new Array(32));
				n2 = this.aSetǃ(31, n1, new Array(32));
				n3 = this.aSetǃ(31, n2, new Array(32));
				return [n3, tree]
			}

			if (!offset) { // tree is fully left indexed, so we need to add a new offset'd node at zero
				list.originOffset = 32768 - 32;
				n1 = this.aSetǃ(31, leaf, new Array(32));
				n2 = this.aSetǃ(31, n1, new Array(32));
				return this.aUnshift(n2, tree)
			} else {
				list.originOffset = offset - 32;
				d2 = tree[0];
				d1 = d2[((offset - 32) >> 10)];
				n1 = this.aSet(((offset - 32) >> 5) & 31, leaf, d1 || new Array(32));
				n2 = this.aSet(((offset - 32) >> 10) & 31, n1, d2);
				n3 = this.aSet(0, n2, tree);
				return n3;
			}
		}
		this.IllegalRange("can't prepend more than 1048576...yet :(");
	},

	trimTail(root, depth, len) {
		// pick the new tail/aft from a leaf in the tree
		// we don't actually trim since we can limit with length
		switch (depth) {
			case 5:
				return root[(len >> 25) & 31][(len >> 20) & 31][(len >> 15) & 31][(len >> 10) & 31][(len >> 5) & 31]
			case 4:
				return root[(len >> 20) & 31][(len >> 15) & 31][(len >> 10) & 31][(len >> 5) & 31]
			case 3:
				return root[(len >> 15) & 31][(len >> 10) & 31][(len >> 5) & 31]
			case 2:
				return root[(len >> 10) & 31][(len >> 5) & 31]
			case 1:
				return root[(len >> 5) & 31]
		}
		return null;
	},

	trimTreeHeight(tree, depth, len) {
		//we can assume that old length > new length
		var newDepth = this.depthFromLength(len)

		// since we have a tail, we never return a tree of 0 height. We would have to ensure we wrap it like:
		// return newDepth == 0 ? [tree] : tree;
		// however, since we know that, and depthFromLength() never returns a 0, we can safely ignore

		switch(depth - newDepth) {
			//old depth cannot be more than 5, new depth cannot be 0
			// case 5:
			// 	return tree[0][0][0][0][0]
			case 4:
				return tree[0][0][0][0]
			case 3:
				return tree[0][0][0]
			case 2:
				return tree[0][0]
			case 1:
				return tree[0]
			case 0:
				return tree;
		}
	},
	trimTree(tree, depth, len) {
		// we assume input is adjusted to correct increment 32, and ignore any tail adjustments
		var newDepth = this.depthFromLength(len)
			, d1, d2, d3, d4, d5;

		switch(depth) {
			case 5:
				d5 = tree
				d4 = d5[(len >> 25) & 31]
				d3 = d4[(len >> 20) & 31]
				d2 = d3[(len >> 15) & 31]
				d1 = d2[(len >> 10) & 31]
				break;
			case 4:
				d4 = tree
				d3 = d4[(len >> 20) & 31]
				d2 = d3[(len >> 15) & 31]
				d1 = d2[(len >> 10) & 31]
				break;
			case 3:
				d3 = tree
				d2 = d3[(len >> 15) & 31]
				d1 = d2[(len >> 10) & 31]
				break;
			case 2:
				d2 = tree
				d1 = d2[(len >> 10) & 31]
				break;
			case 1:
				d1 = tree
				break;
		}

		switch(newDepth) {
			case 5:
				d1 = this.aSlice(0, ((len >> 5) & 31) , d1)
				d2 = this.aSetǃ(((len >> 10) & 31), d1, this.aSlice(0, ((len >> 10) & 31) , d2));
				d3 = this.aSetǃ(((len >> 15) & 31), d2, this.aSlice(0, ((len >> 15) & 31) , d3));
				d4 = this.aSetǃ(((len >> 20) & 31), d3, this.aSlice(0, ((len >> 20) & 31) , d4));
				d5 = this.aSetǃ(((len >> 25) & 31), d4, this.aSlice(0, ((len >> 25) & 31) , d5));
				return d5;
			case 4:
				d1 = this.aSlice(0, ((len >> 5) & 31) , d1)
				d2 = this.aSetǃ(((len >> 10) & 31), d1, this.aSlice(0, ((len >> 10) & 31) , d2));
				d3 = this.aSetǃ(((len >> 15) & 31), d2, this.aSlice(0, ((len >> 15) & 31) , d3));
				d4 = this.aSetǃ(((len >> 20) & 31), d3, this.aSlice(0, ((len >> 20) & 31) , d4));
				return d4;
			case 3:
				d1 = this.aSlice(0, ((len >> 5) & 31) , d1)
				d2 = this.aSetǃ(((len >> 10) & 31), d1, this.aSlice(0, ((len >> 10) & 31) , d2));
				d3 = this.aSetǃ(((len >> 15) & 31), d2, this.aSlice(0, ((len >> 15) & 31) , d3));
				return d3;
			case 2:
				d1 = this.aSlice(0, ((len >> 5) & 31) , d1)
				d2 = this.aSetǃ(((len >> 10) & 31), d1, this.aSlice(0, ((len >> 10) & 31) , d2));
				return d2;
			case 1:
				d1 = this.aSlice(0, ((len >> 5) & 31) , d1)
				return d1;
		}
	},

	reverseTreeReduce(fn, seed, tree, depth, start, i) {
		var d0, d1, d2, d3, d4, d5, j;

		i--
		switch (depth) {
			case 5:
				d5 = tree
				d4 = d5[(i >>> 25) & 31]
				d3 = d4[(i >>> 20) & 31]
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 4:
				d4 = tree
				d3 = d4[(i >>> 20) & 31]
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 3:
				d3 = tree
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 2:
				d2 = tree
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 1:
				d1 = tree
				d0 = d1[(i >>> 5) & 31]
				break;
		}


		d5End: while (true) {
			var d4Stop = ((i >>> 25) << 25) - 1;
			d4End: while (true) {
				var d3Stop = ((i >>> 20) << 20) - 1;
				d3End: while (true) {
					var d2Stop = ((i >>> 15) << 15) - 1;
					d2End: while (true) {
						var d1Stop = ((i >>> 10) << 10) - 1;
						d1End: while (true) {
							var d0stop = ((i >>> 5) << 5) - 1;

							while (i !== d0stop) {
								seed = fn(seed, d0[i & 31], i);
								if (i == start) break d5End;

								i--
							}
							if (i === d1Stop) break d1End;
							d0 = d1[(i >>> 5) & 31]
						}
						if (!d2 || i === d2Stop) break d2End;
						d1 = d2[(i >>> 10) & 31]
						d0 = d1[(i >>> 5) & 31]
					}
					if (!d3 || i === d3Stop) break d3End;
					d2 = d3[(i >>> 15) & 31]
					d1 = d2[(i >>> 10) & 31]
					d0 = d1[(i >>> 5) & 31]
				}
				if (!d4 || i === d4Stop) break d4End;
				d3 = d4[(i >>> 20) & 31]
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
			}
			if (!d5 || i < 0) break d5End;
			d4 = d5[(i >>> 25) & 31]
			d3 = d4[(i >>> 20) & 31]
			d2 = d3[(i >>> 15) & 31]
			d1 = d2[(i >>> 10) & 31]
			d0 = d1[(i >>> 5) & 31]
		}
		return seed;
	},
	cancelableTreeReduce(fn, seed, tree, depth, i, end) {
		var d0, d1, d2, d3, d4, d5, j;
		switch(depth) {
			case 5:
				d5 = tree
				d4 = d5[(i >>> 25) & 31]
				d3 = d4[(i >>> 20) & 31]
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 4:
				d4 = tree
				d3 = d4[(i >>> 20) & 31]
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 3:
				d3 = tree
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 2:
				d2 = tree
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
				break;
			case 1:
				d1 = tree
				d0 = d1[(i >>> 5) & 31]
				break;
		}


		d5End: while(true) {
			d4End: while(true) {
				d3End: while(true) {
					d2End: while(true) {
						d1End: while(true) {
							var end0 = i + 32; //it pays only having full blocks in the tree
							while(i < end0) {
								if (i == end)
									break d5End;

								seed = fn(seed, d0[i & 31], i);
								if (this.isCancelled(seed)) {
									break d5End;
								}
								i++;
							}
							if (!(j = (i >>> 5) & 31)) { //if j == 0
								break d1End;
							}
							d0 = d1[j]
						}
						if (!d2 || ((i >>> 10) & 31) == 0) {
							break d2End;
						}
						d1 = d2[(i >>> 10) & 31]
						d0 = d1[(i >>> 5) & 31]
					}
					if (!d3 || ((i >>> 15) & 31) == 0) {
						break d3End;
					}
					d2 = d3[(i >>> 15) & 31]
					d1 = d2[(i >>> 10) & 31]
					d0 = d1[(i >>> 5) & 31]
				}
				if (!d4 || ( (i >>> 20) & 31) == 0) {
					break d4End;
				}
				d3 = d4[(i >>> 20) & 31]
				d2 = d3[(i >>> 15) & 31]
				d1 = d2[(i >>> 10) & 31]
				d0 = d1[(i >>> 5) & 31]
			}
			if (!d5 || ((i >>> 25) & 31) == 0) {
				break d5End;
			}
			d4 = d5[(i >>> 25) & 31]
			d3 = d4[(i >>> 20) & 31]
			d2 = d3[(i >>> 15) & 31]
			d1 = d2[(i >>> 10) & 31]
			d0 = d1[(i >>> 5) & 31]
		}
		return seed;
	},
	cancelableReduce(fn, seed, list) {
		var pre = list.pre
			, preLen = pre && pre.length || 0
			, len = list.length - (pre && pre.length || 0)
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31


		var pI = 0
		while (pre && !this.isCancelled(seed)) {
			seed = fn(seed, pre.data, pI++)
			pre = pre.link
		}

		if (treeLen && !this.isCancelled(seed)) {
			seed = this.cancelableTreeReduce(fn, seed, list.root, this.depthFromLength(treeLen), 0, treeLen, ap, offset)
		}

		if (tailLen && !this.isCancelled(seed)) {
			var tail = list.aft
			for (var i = 0; tailLen > i && !this.isCancelled(seed); i++) {
				seed = fn(seed, tail[i], preLen + treeLen + i)
			}
		}

		return seed
	},


	// it's weird to have a pre and aft but no root, so let's shift the pre up
	squash(list) {
		var pre = list.pre
			, preLen = (pre && pre.length) || 0
			, root = list.root
			, len = list.length

		if (preLen > 0 && len <= 64) {
			var merged = this.llToArray(pre).concat(root && root[0] || []).concat(list.aft);
			// root should never be height==0, since we have a tail

			list.pre = null;
			list.root = [merged.slice(0, 32)];
			list.aft = merged.length > 32 ? merged.slice(32) : null
		}
		if (len < 32 && !list.aft) {
			list.aft = (root && root[0] || []).slice(0, len)
			list.root = null;
		}
		return list;
	},

// = main/public operations ====================================================

	nth(i, list, notFound) {
		var tree = list.root
			, pre = list.pre
			, totalLength = list.length
			, preLen = ((pre && pre.length) || 0)
		;

		if (i < 0) {
			i += totalLength;
		}

		if (i < 0 || totalLength <= i) { // index is not in the vector bounds
			return notFound
		}

		// index is in prefix linked list
		if (i < preLen) {
			for (var n = 0; n !== i; n++) {
				pre = pre.link;
			}
			return pre.data
		}
		i -= preLen

		var len = totalLength - preLen;
		var treeLen = ((len ) >>> 5) << 5;

		if (len < 32 || i >= treeLen)
			return list.aft[i & 31];

		if (list.originOffset)
			i += list.originOffset;

		if (treeLen <= 1024)
			return tree[(i >> 5) & 31][i & 31];
		if (treeLen <= 32768)
			return tree[(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 1048576)
			return tree[(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 33554432)
			return tree[(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 1073741824)
			return tree[(i >> 25) & 31][(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];

		return this.IllegalRange('range cannot be higher than 1,073,741,824')
	},
	
	empty() {
		return this.factory();
	},
	
	of(...values) {
		if (values.length > 32) {
			//blow up or something
		}
		var vec = new Vector(values.length);
		vec.aft = values;
		return vec;
	},

	append(value, list){
		var vec = this.clone(list)
			, preLen = vec.pre && vec.pre.length || 0
			, aft = vec.aft
			, aftLen = aft && aft.length || 0
			, totalLength = vec.length
			, len = totalLength - preLen
			, newLength = totalLength + 1

		if (this.OCCULANCE_ENABLE) {
			// shared past the offset length
			var aftDelta = vec.length & 31; //vec.length - 1 ???
			// another vector is sharing and invisibly mutated our aft
			if (aftDelta != aftLen) {
				aft = vec.aft = this.aSlice(0, aftDelta, aft)
			}

			if (!aft) {
				aft = vec.aft = []
			}
			aft.push(value);
		} else {
			vec.aft = this.aPush(value, aft || [])
		}

		if ((newLength & 31)  === 0) {
			vec.root = this.appendLeafOntoTree(aft, vec.root, (((newLength - 32) + (list.originOffset || 0)) >>> 5) << 5);
			vec.aft = null
		}
		vec.length = newLength;

		return vec;
	},

	appendǃ(value, vec) {
		var aft = vec.aft || (vec.aft = [])
			, totalLength = vec.length
			, preLen = vec.pre && vec.pre.length || 0
			, len = totalLength - preLen
			, newLength = totalLength + 1
		// 	, preLen = (vec.pre && vec.pre.length) || 0
		// 	, tailLen = (totalLength - preLen) & 31
		// if (aft.length !== tailLen) {
		// 	wtf?
		// }
		
		aft.push(value);

		if ((newLength & 31)  === 0) {
			var treeLen = ((((len + 1) - 32) + (vec.originOffset || 0)) >>> 5) << 5;
			vec.root = this.appendLeafOntoTreeǃ(aft, vec.root, treeLen);
			vec.aft = null
		}
		vec.length = newLength;

		return vec;
	},
	
	prepend(value, list) {
		//TODO: there a bug here when above 1024
		// we cant just prepend a leaf to the front without either:
		// * rebalancing the tree above depth 2(easiest to implement)
		// * adopting and rrb style index cache on the node(most flexible)
		// * adopting an entire tree index offset (likely cheapest)
		var vec = this.clone(list)
			, totalLength = vec.length
			, newLength = totalLength + 1


		var pre = this.addLL(value, vec.pre)
		
		if (pre.length == 32) {
			vec.root = this.prependLeafOntoTree(this.llToArray(pre), vec, ((newLength - 32) >>> 5) << 5);
			vec.pre = null
		} else {
			vec.pre = pre
		}

		vec.length = newLength;

		return vec;
	},
	
	update(i, value, list) {
		var length = list.length
			, pre = list.pre
			, preLen = pre && pre.length || 0
			, len = length - preLen
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31
			, n = i - preLen

		if (!length)
			return list;

		var vec = this.clone(list);

		if (preLen > i) {
			var newPre = this.llToArray(pre)
			newPre[i] = value;
			newPre = this.arrayToLL(newPre)
			vec.pre = newPre
			return vec;
		}

		if (i > (preLen + treeLen)) {
			vec.aft = vec.aft ? this.aSlice(0, tailLen, vec.aft) : null
			vec.aft[n & 31] = value;
			return vec;
		}

		var d0, d1, d2, d3, d4, d5
			, depth = this.depthFromLength(treeLen)
			, tree = vec.root

		switch(depth) {
			case 5:
				d5 = tree
				d4 = d5[(n >> 25) & 31]
				d3 = d4[(n >> 20) & 31]
				d2 = d3[(n >> 15) & 31]
				d1 = d2[(n >> 10) & 31]
				d0 = d1[(n >> 5) & 31]
				d0 = this.aSet(n & 31, value, d0)
				d1 = this.aSet((n >> 5) & 31, d0, d1)
				d2 = this.aSet((n >> 10) & 31, d1, d2)
				d3 = this.aSet((n >> 15) & 31, d2, d3)
				d4 = this.aSet((n >> 20) & 31, d3, d4)
				d5 = this.aSet((n >> 25) & 31, d4, d5)
				vec.root = d5;
				break;
			case 4:
				d4 = tree
				d3 = d4[(n >> 20) & 31]
				d2 = d3[(n >> 15) & 31]
				d1 = d2[(n >> 10) & 31]
				d0 = d1[(n >> 5) & 31]
				d0 = this.aSet(n & 31, value, d0)
				d1 = this.aSet((n >> 5) & 31, d0, d1)
				d2 = this.aSet((n >> 10) & 31, d1, d2)
				d3 = this.aSet((n >> 15) & 31, d2, d3)
				d4 = this.aSet((n >> 20) & 31, d3, d4)
				vec.root = d4;
				break;
			case 3:
				d3 = tree
				d2 = d3[(n >> 15) & 31]
				d1 = d2[(n >> 10) & 31]
				d0 = d1[(n >> 5) & 31]
				d0 = this.aSet(n & 31, value, d0)
				d1 = this.aSet((n >> 5) & 31, d0, d1)
				d2 = this.aSet((n >> 10) & 31, d1, d2)
				d3 = this.aSet((n >> 15) & 31, d2, d3)
				vec.root = d3;
			case 2:
				d2 = tree
				d1 = d2[(n >> 10) & 31]
				d0 = d1[(n >> 5) & 31]
				d0 = this.aSet(n & 31, value, d0)
				d1 = this.aSet((n >> 5) & 31, d0, d1)
				d2 = this.aSet((n >> 10) & 31, d1, d2)
				vec.root = d2;
				break;
			case 1:
				d1 = tree
				d0 = d1[(n >> 5) & 31]
				d0 = this.aSet(n & 31, value, d0)
				d1 = this.aSet((n >> 5) & 31, d0, d1)
				vec.root = d1;
				break;
		}

		return vec;
	},

	take(n, list) {
		var length = list.length
			, pre = list.pre
			, preLen = pre && pre.length || 0
			, len = length - preLen
			, treeLen = (len >>> 5) << 5
			, vec = this.empty()

		vec.length = n;

		if (n == 0) {
			return vec;
		}

		if (n < 0) {
			n += length;
		}

		if (n >= length) {
			return list;
		}

		if (n < preLen) { //trim only pre
			vec.aft = this.aSlice(0, n, this.llToArray(pre));
			return vec;
		}

		if ((treeLen + preLen) < n) { // trim only tail
			var _end = len & 31;
			vec.aft = _end ? this.aSlice(0, _end, list.aft) : null;
			vec.root = list.root;
			vec.pre = pre;
			return vec;
		}

		// - trim only tree -----

		var _newTreeLen = n - preLen;
		var depth = this.depthFromLength(treeLen);

		if (_newTreeLen < 32) {
			vec.aft = this.trimTail(list.root, depth, _newTreeLen);
		} else {
			vec.aft = (_newTreeLen & 31) == 0 ? null : this.trimTail(list.root, depth, _newTreeLen);
			vec.root =  this.trimTreeHeight(list.root, depth, (_newTreeLen >>> 5) << 5);
		}

		vec.pre = pre;
		if (preLen > 0 && n <= 64) {
			return this.squash(vec)
		}

		return vec;
	},

	drop(n, list) {

		var length = list.length
			, newLength = length - n
			, pre = list.pre
			, preLen = pre && pre.length || 0
			, len = length - preLen
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31
			, vec = this.empty()
			, d0, d1, d2, d3, d4, d5

		if (n < 0) {
			n += length;
		}

		if (n >= length) {
			return vec;
		}

		vec.length = newLength

		if (preLen > n) { // only need to drop tail
			var _n = preLen - n;
			while (pre.length != _n) {
				pre = pre.link
			}
			vec.pre = pre;
			vec.root = list.root;
			vec.aft = list.aft;
			return vec;
		}

		if (n > (preLen + treeLen)) { // all in tail
			vec.aft = this.aSlice(tailLen - vec.length, tailLen, list.aft)
			return vec;
		}

		// do tree trim

		var newRoot, newPre;
		var depth = this.depthFromLength(treeLen);
		var start = n - preLen
		var newTreeLen = treeLen - (start)
		var newDepth = this.depthFromLength(newTreeLen);

		switch(depth) {
			case 5:
				d5 = list.root
				d4 = d5[(start >> 25) & 31]
				d3 = d4[(start >> 20) & 31]
				d2 = d3[(start >> 15) & 31]
				d1 = d2[(start >> 10) & 31]
			case 4:
				d4 = list.root
				d3 = d4[(start >> 20) & 31]
				d2 = d3[(start >> 15) & 31]
				d1 = d2[(start >> 10) & 31]
			case 3:
				d3 = list.root
				d2 = d3[(start >> 15) & 31]
				d1 = d2[(start >> 10) & 31]
			case 2:
				d3 = list.root
				d1 = d2[(start >> 10) & 31]
			case 1:
				d1 = list.root
				break;
		}
		
		//adjust height
		switch(depth - newDepth) {
			//case 5: since we don't have a 0 depth due to tail, this path never occurs
			case 4:// dropping 4 levels
				// var unDrop = 0;
				// unDrop += ((start >> 25) & 31) * 33
				// unDrop += ((start >> 20) & 31) * 33
				// unDrop += ((start >> 15) & 31) * 33
				// unDrop += ((start >> 10) & 31) * 33
				// unDrop += ((start >> 5) & 31) * 33
				break
			case 3:
				break
			case 2:
				break
			case 1:
				break
			case 0:
				break;
		}

		switch(newDepth) {
			case 5:
			case 4:
			case 3:
			case 2:
				this.IllegalRange('cannot drop when length is more than 1024...yet');
				break;
			case 1:
				// less than 1024, so logic is simple
				newPre = this.aSlice(start & 31, 32, d1[(start >> 5) & 31])
				var x = (((start >> 5) & 31) + 1)
				d1 = this.aSlice(x, d1.length, d1)
				newRoot = d1.length ? d1 : null
				break;
		}

		vec.pre = this.arrayToLL(newPre);
		vec.root = newRoot;
		vec.aft = list.aft;
		return vec;
	},

	appendAll(left, right) {
		var vec = this.clone(left)
			, leftPre = left.pre
			, leftPreLength = leftPre &&leftPre.length || 0
			, leftLength = left.length
			, leftTreeLength = ((leftLength - leftPreLength) >>> 5) << 5
			, leftTailLength = (leftLength - leftPreLength) & 31

		// clone right-most edge all the way down, so we can do fast append
		vec.root = left.root ? this.trimTree(left.root, this.depthFromLength(leftTreeLength), leftTreeLength) : null;
		vec.aft = vec.aft ? this.aSlice(0, leftTailLength, vec.aft) : null


		vec = this.reduce(function addToLeft(list, value) {
			return this.appendǃ(value, list)
		}.bind(this), vec, right);

		return this.squash(vec);
	},

	reduce(fn, seed, list) {
		// todo: do we need to unwrap CancelToken here?
		return this.cancelableReduce(fn, seed, list)
	},
	reduceRight(fn, seed, list) {
		var pre = list.pre
			, len = list.length - (pre && pre.length || 0)
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31

		if (tailLen) {
			var tail = list.aft
			var i = tail.length;
			while (i--) {
				seed = fn(seed, tail[i])
			}
		}

		if (treeLen) {
			seed = this.reverseTreeReduce(fn, seed, list.root, this.depthFromLength(treeLen), 0, treeLen)
		}

		if (pre) {
			var head = this.llToArray(pre);
			var i = head.length;
			while (i--) {
				seed = fn(seed, head[i])
			}
		}

		return seed
	},

	Finder,
	find(predicate, list) {

		return this.cancelableReduce(new this.Finder(predicate).toReducer(), null, list)
	}


};