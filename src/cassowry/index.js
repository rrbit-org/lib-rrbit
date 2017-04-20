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
	OCCULANCE_ENABLE: true,
	Vector,
	CancelToken,
	isCancelled(value) {
		return value instanceof this.CancelToken
	},
	done(value, index, depth) {
		return new this.CancelToken(value, index, depth)
	},
	factory() {
		return new this.Vector();
	},
	clone(list){
		var vec = this.factory();
		vec.length = list.length;
		vec.root = list.root;
		vec.pre = list.pre;
		vec.aft = list.aft;
		if (list.originOffset)
			vec.originOffset = list.originOffset

		return vec;
	},

	// optimize for prepend performance
	SinglyLinkedList(data, len, next) {
		this.data = data;
		this.link = next;
		this.length = len;
	},
// enable v8 to optimize by hiding Errors from happy path
	IllegalRange(msg) {
		throw new RangeError(msg || 'out of range')
	},


	// = linked list helpers ===========================================================
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
			this.addLL(arr[i], list);
		}
		return list;
	},

	// = immutable array helpers =======================================================
	aCopy(arr) {
		var len = arr.length;
		var result = new Array(len);
		for (var i = 0; i < len; i++) {
			result[i] = arr[i]
		}
		return result;
	},
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
	aLast(arr) {
		return arr[Math.max(arr.length, 0) - 1]
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
	
	// round down to divisible of 32
	tailOffset(length) {
		return (length >>> 5) << 5
	},
	//round to no greater than 32
	tailIndex(index) {
		return index & 31
	},
	
	depthFromLength: (function() {
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

		return function(len) {
			if (len <= 1024) return 1;
			if (len <= 32768) return 2;
			if (len <= 1048576) return 3;
			if (len <= 33554432) return 4;
			if (len <= 1073741824) return 5;
			return 6;
		}
	})(),
	
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

	prependLeafOntoTree(leaf, tree, treeLen) {
		var d1
			, d2
			, d3
			, d4
			, n1
			, n2
			, n3
			, n4

		if (!tree || treeLen == 0) {
			return [leaf]
		}

		if (treeLen <= 1024) { // depth 1
			return tree.length == 32 ? [[leaf], tree] : this.aUnshift(leaf, tree);
		}

		if (treeLen <= 32768) { // depth 2
			this.IllegalRange("can't prepend more than 1024...yet :(")
			// there's probably a bug here. we should rebalance the tree
			// to ensure all nodes are front packed...or adopt rrb
			d1 = tree[0]

			n1 = d1.length === 32 ? [leaf] : this.aUnshift(leaf, d1);

			if (d1.length === 32) {
				return tree.length == 32 ? [[n1], tree] : this.aUnshift(n1, tree);
			}
			return this.aSet(0, n1, tree) //update existing slot
		}

		if (treeLen <= 1048576) { // depth 3
			d2 = tree[0]
			d1 = d2[0]

			n1 = d1.length === 32 ? [leaf] : this.aUnshift(leaf, d1);
			n2 = d1.length !== 32 ? this.aSet(0, n1, d2) : (d2.length === 32 ? [n1] : this.aUnshift(n1, d2));
			
			// return this.updateRoot(n2, tree, n2.length === 1 && d2.length == 32)
			if (n2.length === 1 && d2.length == 32) { // append to end
				return tree.length == 32 ? [[n2], tree] : this.aUnshift(n2, tree);
			}
			return this.aSet(0, n2, tree) //update existing slot
		}
	},

	trimTail(root, depth, len) {
		switch (depth) {
			case 5:
				return this.aSlice(0, len & 31, root[(len >> 25) & 31][(len >> 20) & 31][(len >> 15) & 31][(len >> 10) & 31][(len >> 5) & 31])
			case 4:
				return this.aSlice(0, len & 31, root[(len >> 20) & 31][(len >> 15) & 31][(len >> 10) & 31][(len >> 5) & 31])
			case 3:
				return this.aSlice(0, len & 31, root[(len >> 15) & 31][(len >> 10) & 31][(len >> 5) & 31])
			case 2:
				return this.aSlice(0, len & 31, root[(len >> 10) & 31][(len >> 5) & 31])
			case 1:
				return this.aSlice(0, len & 31, root[(len >> 5) & 31])
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
			, len = list.length - (pre && pre.length || 0)
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31


		while (pre && !this.isCancelled(seed)) {
			seed = fn(seed, pre.data)
			pre = pre.link
		}

		if (treeLen && !this.isCancelled(seed)) {
			seed = this.cancelableTreeReduce(fn, seed, list.root, this.depthFromLength(treeLen), 0, treeLen)
		}

		if (tailLen && !this.isCancelled(seed)) {
			var tail = list.aft
			for (var i = 0; tailLen > i && !this.isCancelled(seed); i++) {
				seed = fn(seed, tail[i])
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

		if (len < 32 || !(i < (treeLen + preLen)))
			return list.aft[i & 31];

		if (list.originOffset)
			i += list.originOffset

		if (treeLen < 32)
			return tree[i & 31];
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
			, aft = vec.aft
			, aftLen = aft && aft.length || 0
			, totalLength = vec.length
			, newLength = totalLength + 1

		if (this.OCCULANCE_ENABLE) {
			// shared past the offset length
			var aftDelta = vec.length & 31; //vec.length - 1 ???
			if (aftDelta != aftLen) {
				// another vector is sharing and invisibly mutated our aft
				aft = vec.aft = aft.slice(0, aftDelta)
			}

			if (!aft) {
				aft = vec.aft = []
			}
			aft.push(value);
		} else {
			vec.aft = this.aPush(value, aft || [])
		}

		if ((newLength & 31)  === 0) {
			vec.root = this.appendLeafOntoTree(aft, vec.root, ((newLength - 32) >>> 5) << 5);
			vec.aft = null
		}
		vec.length = newLength;

		return vec;
	},

	appendǃ(value, vec) {
		var aft = vec.aft || (vec.aft = [])
			, totalLength = vec.length
			, newLength = totalLength + 1
		// 	, preLen = (vec.pre && vec.pre.length) || 0
		// 	, tailLen = (totalLength - preLen) & 31
		// if (aft.length !== tailLen) {
		// 	wtf?
		// }
		
		aft.push(value);

		if ((newLength & 31)  === 0) {
			vec.root = this.appendLeafOntoTreeǃ(aft, vec.root, ((newLength - 32) >>> 5) << 5);
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
			vec.root = this.prependLeafOntoTree(this.llToArray(pre), vec.root, ((newLength - 32) >>> 5) << 5);
			vec.pre = null
		} else {
			vec.pre = pre;
		}

		vec.length = newLength;

		return vec;
	},
	
	update(i, value, list) {
		throw new Error('operation not supported...yet')
	},

	take(n, list) {
		var length = list.length
			, pre = list.pre
			, preLen = pre && pre.length || 0
			, len = length - preLen
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31
			, vec = this.empty()
			, d0, d1, d2, d3, d4, d5

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
			var _end = n & 31;
			vec.aft = _end ? this.aSlice(0, _end, list.aft) : null;
			vec.root = list.root;
			vec.pre = pre;
			return vec;
		}

		// - trim only tree -----

		var _newTreeLen = n - preLen;
		var depth = this.depthFromLength(treeLen);

		if (n < 32) {
			vec.aft = this.trimTail(list.root, depth, _newTreeLen);
		} else {
			vec.root =  this.trimTreeHeight(list.root, depth, (_newTreeLen >>> 5) << 5);
		}

		vec.pre = pre;
		return this.squash(vec)
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
				d1 = this.aSlice((((start >> 5) & 31) + 1), 32, d1)
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
			, leftPreLength = leftPre.length || 0
			, leftLength = left.length
			, leftTreeLength = ((leftLength - leftPreLength) >>> 5) << 5
			// , leftDepth = this.depthFromLength(leftTreeLength)
			// , rightPre = right.pre
			// , rightPreLength = rightPre.length || 0
			// , rightLength = right.length
			// , rightTreeLength = ((rightLength - rightPreLength) >>> 5) << 5
			// , rightDepth = this.depthFromLength(rightTreeLength)

		vec.length = leftLength;
		vec.pre = left.pre;
		vec.aft = left.aft;
		// clone right-most edge all the way down, so we can do fast append
		vec.root = left.root ? this.trimTree(left.root, this.depthFromLength(leftTreeLength), leftTreeLength) : null;



		vec = this.reduce(function addToLeft(list, value) {
			return this.appendǃ(value, list)
		}.bind(this), right, vec);

		return this.squash(vec);
	},

	reduce(fn, seed, list) {
		// todo: do we need to unwrap CancelToken here?
		return this.cancelableReduce(fn, seed, list)
	},
	reduceRight(fn, seed, list) {
		throw new Error('operation not supported...yet')
	},

	find(predicate, list) {
		var lib = {
				Token: this.CancelToken
				, predicate
				, step(_, value, index) {
					return this.predicate(value) ? new this.Token(value, index) : null
				}
			}

		var result = this.cancelableReduce(lib.step.bind(lib), null, list)
		return this.isCancelled(result) ? result : {
				index: -1,
				value: null
			};

	}


};