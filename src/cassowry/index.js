

export const Cassowry = {
	 Vector(len) {
		 this.length = len || 0;
		 this.root = null; // the tree structure
		 this.pre = null;  // transient front of list, optimized for fast prepends only(singly linked list)
		 this.aft = null;    // transient tail of list, optimized for fast appends only  (native array)
	 },

	// optimize for prepend performance
	SinglyLinkedList(data, len, next) {
		this.data = data;
		this.link = next;
		this.length = len;
	},
// enable v8 to optimize by hiding Errors from happy path
	IllegalHeight() {
		throw new Error('length cannot be greater than 1073741824')
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

	// = tree math helpers =======================================================
	
	// round down to nearest 32
	tailOffset(length) {
		return (length >>> 5) << 5
	},
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
		return this.IllegalHeight();
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

	prependLeafOntoTree(leaf, tree, treeLength) {},


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
				list = list.link;
			}
			return list.data
		}

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

		// if ((newLength) === 1073741824) {
		// 	return this.IllegalHeight();
		// }

		// shared past the offset length
		//*
		var aftDelta = vec.length & 31; //vec.length - 1 ???
		if (aftDelta != aftLen) {
			// another vector is sharing and invisibly mutated our aft
			aft = vec.aft = aft.slice(0, aftDelta)
		}

		if (!aft) {
			aft = vec.aft = []
		}
		aft.push(value);
		/*/
		vec.aft = this.aPush(value, aft || [])

		//*/

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

		// if ((newLength) === 1073741824) {
		// 	return this.IllegalHeight();
		// }

		aft.push(value);

		if ((newLength & 31)  === 0) {
			vec.root = this.appendLeafOntoTree(aft, vec.root, (totalLength >>> 5) << 5);
			vec.aft = null
		}
		vec.length = newLength;

		return vec;
	},
	
	prepend(value, list) {
		var vec = this.clone(list)
			, totalLength = vec.length
			, newLength = totalLength + 1


		var pre = this.addLL(value, vec.pre)
		
		if (pre.length == 32) {
			vec.root = prependLeafOntoTree(this.llToArray(pre), vec.root, ((newLength - 32) >>> 5) << 5);
			vec.pre = null
		} else {
			vec.pre = pre;
		}

		vec.length = newLength;

		return vec;
	}


};