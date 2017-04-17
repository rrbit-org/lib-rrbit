var iterator;

function Vector(len) {
	this.length = len || 0;
	this.root = null; // the tree structure
	this.pre = null;  // transient front of list, optimized for fast prepends only(singly linked list)
	this.aft = null;    // transient tail of list, optimized for fast appends only  (native array)
}

Vector.prototype[Symbol.iterator] = function() {
	return iterator(this, 0, this.length);
}

export const Cassowry = {
	OCCULANCE_ENABLE: true,
	Vector: Vector,
	factory() {
		return new this.Vector();
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
	
	aReduceTo: function(fn, seed, array, len) {
		for(var i = 0; len > i; i++) {
			seed = fn(seed, array[i])
		}
		return seed;
	},

	// = tree math helpers =======================================================
	
	// round down to nearest 32
	tailOffset(length) {
		return (length >>> 5) << 5
	},
	//round to no greater than 32
	tailIndex(index) {
		return index & 31
	},
	
	depthFromLength(len) {
		// if (len < 32) return 0; // we'll never actually check for this height due to tail optimization
		if (len <= 1024) return 1;
		if (len <= 32768) return 2;
		if (len <= 1048576) return 3;
		if (len <= 33554432) return 4;
		if (len <= 1073741824) return 5;
		return this.IllegalRange('length cannot be greater than 1073741824');
	},
	
	/*
	 * optimization strategy here is a form of loop unrolling, where instead
	 * of looping all the way down to child-most node, we use a switch case
	 * specific to depth of tree.
	 */
	appendLeafOntoTree(leaf, tree, treeLen) {
		var   d1
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

		// if (treeLen < 32) {
		// 	return [leaf]
		// }

		if (treeLen <= 1024) { // Math.pow(32, 2)
			return tree.length == 32 ? [tree, [leaf]] : this.aPush(leaf, tree);
		}

		if (treeLen <= 32768) { // Math.pow(32, 3)
			d1 = this.aLast(tree)

			n1 = this.addNode(leaf, d1, true)
			return this.updateRoot(n1, tree, d1.length === 32)
		}

		if (treeLen <= 1048576) {// Math.pow(32, 4)
			d2 = this.aLast(tree)
			d1 = this.aLast(d2)

			n1 = this.addNode(leaf, d1, true)
			n2 = this.addNode(n1, d2, d1.length == 32)
			return this.updateRoot(n2, tree, n2.length === 1 && d2.length == 32)
		}

		if (treeLen <= 33554432) {// Math.pow(32, 5)
			d3 = this.aLast(tree)
			d2 = this.aLast(d3)
			d1 = this.aLast(d2)

			n1 = this.addNode(leaf, d1, true)
			n2 = this.addNode(n1, d2, d1.length == 32)
			n3 = this.addNode(n2, d3, n2.length === 1 && d2.length == 32)
			return this.updateRoot(n3, tree, n3.length == 1 && d3.length == 32)
		}

		if (treeLen <= 1073741824) { // Math.pow(32, 6)
			d4 = this.aLast(tree)
			d3 = this.aLast(d4)
			d2 = this.aLast(d3)
			d1 = this.aLast(d2)

			n1 = this.addNode(leaf, d1, true)
			n2 = this.addNode(n1, d2, d1.length === 32)
			n3 = this.addNode(n2, d3, n2.length === 1 && d2.length === 32)
			n4 = this.addNode(n3, d4, n3.length === 1 && d3.length === 32)
			return this.updateRoot(n4, tree, n4.length == 1 && d4.length == 32)
		}
	},
	addNode(child, parent, shouldAppend) {
		if (shouldAppend) {
			return parent.length === 32 ? [child] : this.aPush(child, parent);
		}
		return this.aSet(parent.length - 1, child, parent)
	},

	updateRoot(child, root, expand) {
		if (expand) {
			return root.length == 32 ? [root, [child]] : this.aPush(child, root);
		}
		return this.aSet(root.length - 1, child, root)
	},
	appendLeafOntoTreeǃ(leaf, tree, treeLen) {
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

		// if (treeLen < 32) // depth 0
		// 	return [leaf];

		if (treeLen <= 1024) { // depth 1
			if (tree.length == 32)
				return [tree, [leaf]];

			tree.push(leaf);
			return tree;
		}

		if (treeLen <= 32768) { // depth 2
			d1 = this.aLast(tree)

			n1 = this.addNodeǃ(leaf, d1, true)
			return this.updateRootǃ(n1, tree, d1.length === 32)
		}
		
		if (treeLen <= 1048576) { // depth 3
			d2 = this.aLast(tree)
			d1 = this.aLast(d2)

			n1 = this.addNodeǃ(leaf, d1, true)
			n2 = this.addNodeǃ(n1, d2, d1.length == 32)
			return this.updateRootǃ(n2, tree, n2.length === 1 && d2.length == 32)
		}
		
		if (treeLen <= 33554432) { // depth 4
			d3 = this.aLast(tree)
			d2 = this.aLast(d3)
			d1 = this.aLast(d2)

			n1 = this.addNodeǃ(leaf, d1, true)
			n2 = this.addNodeǃ(n1, d2, d1.length == 32)
			n3 = this.addNodeǃ(n2, d3, n2.length === 1 && d2.length == 32)
			return this.updateRootǃ(n3, tree, n3.length == 1 && d3.length == 32)
		}
		
		if (treeLen <= 1073741824) { // depth 5
			d4 = this.aLast(tree)
			d3 = this.aLast(d4)
			d2 = this.aLast(d3)
			d1 = this.aLast(d2)

			n1 = this.addNodeǃ(leaf, d1, true)
			n2 = this.addNodeǃ(n1, d2, d1.length === 32)
			n3 = this.addNodeǃ(n2, d3, n2.length === 1 && d2.length === 32)
			n4 = this.addNodeǃ(n3, d4, n3.length === 1 && d3.length === 32)
			return this.updateRootǃ(n4, tree, n4.length == 1 && d4.length == 32)
		}

	},

	addNodeǃ(child, parent, shouldAppend) {
		if (shouldAppend) {
			if (parent.length === 32)
				return [child];

			parent.push(child);
			return parent;
		}
		// parent[parent.length - 1] = child;
		return parent
	},

	updateRootǃ(child, root, expand) {
		if (expand) {
			if (root.length == 32)
				return [root, [child]];

			root.push(child);
			return root;
		}
		// root[root.length - 1] = child;
		return root
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

	treeReduceInner: function treeReduceInner(fn, seed, tree, depth) {
		if (depth == 0)
			return this.aReduceTo(fn, seed, tree, tree.length);

		for (var i = 0, len = tree.length; len > i; i++) {
			seed = this.treeReduceInner(fn, seed, tree[i], depth - 1)
		}
		return seed;
	},
	
	treeReduce(fn, seed, tree, treeLen) {
		return this.treeReduceInner(fn, seed, tree, this.depthFromLength(treeLen))
	},


// = main operations ====================================================

	nth(i, list, notFound) {
		var tree = list.root
			, pre = list.pre
			, aft = list.aft
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
			return aft[i & 31];

		if (treeLen < 32)
			return tree[i & 31];
		if (treeLen <= 1024)
			return tree[(i >> 5) & 31][i & 31];
		if (treeLen <= 32768)
			return tree[(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 1048576)
			return tree[(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 1048576)
			return tree[(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 1048576)
			return tree[(i >> 25) & 31][(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];
		if (treeLen <= 33554432)
			return tree[(i >> 30) & 31][(i >> 25) & 31][(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];

		return tree[(i >> 35) & 31][(i >> 30) & 31][(i >> 25) & 31][(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][i & 31];
	},
	empty() {
		return new this.Vector(0);
	},
	of(...values) {
		if (values.length > 32) {
			//blow up or something
		}
		var vec = new Vector(values.length);
		vec.aft = values;
		return vec;
	},

	clone(list){
		var vec = new this.Vector(list.length);
		vec.root = list.root;
		vec.pre = list.pre;
		vec.aft = list.aft;

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
			vec.root = this.appendLeafOntoTree(aft, vec.root, (totalLength >>> 5) << 5);
			vec.aft = null
		}
		vec.length = newLength;

		return vec;
	},

	appendǃ(value, vec) {
		var aft = vec.aft || (vec.aft = [])
			, totalLength = vec.length
			, newLength = totalLength + 1

		aft.push(value);

		if ((newLength & 31)  === 0) {
			vec.root = this.appendLeafOntoTreeǃ(aft, vec.root, (totalLength >>> 5) << 5);
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

		if (n < 0) {
			n += length;
		}

		if (n >= length) {
			return list;
		}

		if (n < preLen) { //trim only pre
			var vec = this.empty();
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

		var xIt = (index, child, parent) => {
			if (child.length) {
				parent = this.aSlice(0, index, parent)
				parent[index - 1] = child;
				return parent
			}
			return this.aSlice(0, index - 1, parent)
		}

		var newRoot, newAft;
		var depth = this.depthFromLength(treeLen);
		var newDepth = this.depthFromLength(n - preLen);
		switch(depth) {
			case 5:
				d5 = list.root
				d4 = d5[(len >> 25) & 31]
				d3 = d4[(len >> 20) & 31]
				d2 = d3[(len >> 15) & 31]
				d1 = d2[(len >> 10) & 31]
				break;
			case 4:
				d4 = list.root
				d3 = d4[(len >> 20) & 31]
				d2 = d3[(len >> 15) & 31]
				d1 = d2[(len >> 10) & 31]
				break;
			case 3:
				d3 = list.root
				d2 = d3[(len >> 15) & 31]
				d1 = d2[(len >> 10) & 31]
				break;
			case 2:
				d2 = list.root
				d1 = d2[(len >> 10) & 31]
				break;
			case 1:
				d1 = list.root
				break;
		}

		switch(newDepth) {
			case 5:
				newAft = this.aSlice(0, 0 & 31, d1[(len >> 5) & 31])
				d1 = this.aSlice(0, (((len >> 5) & 31) - 1), d1)
				d2 = xIt((len >> 10) & 31, d1, d2)
				d3 = xIt((len >> 15) & 31, d2, d3)
				d4 = xIt((len >> 20) & 31, d3, d4)
				d5 = xIt((len >> 25) & 31, d4, d5)
				newRoot = d5
				break;
			case 4:
				newAft = this.aSlice(0, 0 & 31, d1[(len >> 5) & 31])
				d1 = this.aSlice(0, (((len >> 5) & 31) - 1), d1)
				d2 = xIt((len >> 10) & 31, d1, d2)
				d3 = xIt((len >> 15) & 31, d2, d3)
				d4 = xIt((len >> 20) & 31, d3, d4)
				newRoot = d4
				break;
			case 3:
				newAft = this.aSlice(0, 0 & 31, d1[(len >> 5) & 31])
				d1 = this.aSlice(0, (((len >> 5) & 31) - 1), d1)
				d2 = xIt((len >> 10) & 31, d1, d2)
				d3 = xIt((len >> 15) & 31, d2, d3)
				newRoot = d3
				break;
			case 2:
				newAft = this.aSlice(0, 0 & 31, d1[(len >> 5) & 31])
				d1 = this.aSlice(0, (((len >> 5) & 31) - 1), d1)
				d2 = xIt((len >> 10) & 31, d1, d2)
				newRoot = d2
				break;
			case 1:
				if ((n - preLen) < 32) {
					newAft = this.aSlice(0, 0 & 31, d1[(len >> 5) & 31])
					newRoot = null;
				} else {
					newAft = this.aSlice(0, 0 & 31, d1[(len >> 5) & 31])
					newRoot = this.aSlice(0, (((len >> 5) & 31) - 1), d1)
				}

				break;
		}

		// it's weird to have a pre and aft but no root, so let's shift the pre up
		if (preLen !== 0 && n <= 64) {
			var merged = this.llToArray(pre).concat(newAft);
			newRoot = [merged.slice(0, 32)];
			newAft = merged.length > 32 ? merged.slice(32) : null
		}
		vec.aft = newAft;
		vec.root = newRoot;
		vec.pre = pre;
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

		switch(newDepth) {
			case 5:
			case 4:
			case 3:
			case 2:
				this.IllegalRange('cannot drop when length is more than 1024...yet')
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

	reduce(fn, vec, seed) {
		// iterate over pre first
		var pre = vec.pre
			, len = vec.length - (pre && pre.length || 0)
			, treeLen = (len >>> 5) << 5
			, tailLen = len & 31
		
		while (pre) {
			seed = fn(seed, pre.data)
			pre = pre.link
		}
		
		if (treeLen) {
			seed = this.treeReduce(fn, seed, vec.root, treeLen)
		}
		
		if (tailLen) {
			seed = this.aReduceTo(fn, seed, vec.aft)
		}
		
		return seed;

	},

	map(fn, list) {
		var addIn = {
			fn
			, appendǃ: this.appendǃ
			, appendLeafOntoTreeǃ: this.appendLeafOntoTreeǃ
			, aLast: this.aLast
			, addNodeǃ: this.addNodeǃ
			, updateRootǃ: this.updateRootǃ
			, step: function(list, value) {
				return this.appendǃ(this.fn(value))
			}
		};
		return this.reduce(addIn.step.bind(addIn), list, this.empty())
	}


};