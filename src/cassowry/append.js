import {CtorTrait} from './constructors'



// round down to nearest 32
function tailOffset(length) {
	return (length >>> 5) << 5
}
function tailLength(total) {
	return total % 32
}


// = immutable array helpers =======================================================
function aCopy(arr) {
	var len = arr.length;
	var result = new Array(len);
	for (var i = 0; i < len; i++) {
		result[i] = arr[i]
	}
	return result;
}

function aPush(value, arr) {
	var len = arr.length;
	var result = new Array(len + 1);

	for (var i = 0; i < len; i++) {
		result[i] = arr[i]
	}

	result[len] = value;
	return result;
}

function aSet(index, value, arr) {
	var len = arr.length;
	var result = new Array(len);
	for (var i = 0; i < len; i++) {
		result[i] = arr[i]
	}
	result[index] = value;
	return result;
}

function aLast(arr) {
	return arr[Math.max(arr.length, 0) - 1]
}



function depthFromLength(len) {
	// if (len < 32) return 0; // we'll never actually check for this height due to tail optimization
	if (len <= 1024) return 1;
	if (len <= 32768) return 2;
	if (len <= 1048576) return 3;
	if (len <= 1048576) return 4;
	if (len <= 1048576) return 5;
	if (len <= 33554432) return 6;
	if (len <= 1073741824) return 7;
	return IllegalHeight();
}

// enable v8 to optimize by hiding Errors from happy path
function IllegalHeight() {
	throw new Error('length cannot be greater than 1073741824')
}




export function append(value, list) {
	var vec = CtorTrait.clone(list)
		, aft = vec.aft
		, aftLen = aft && aft.length || 0
		, totalLength = vec.length
		, newLength = totalLength + 1

	if ((newLength) === 1073741824) {
		return IllegalHeight();
	}

	// shared past the offset length
	var aftDelta = tailLength(vec.length); //vec.length - 1 ???
	if (aftDelta != aftLen) {
		// another vector is sharing and invisibly mutated our aft
		aft = vec.aft = aft.slice(0, aftDelta)
	}

	if (!aft) {
		aft = vec.aft = []
	}
	aft.push(value)

	if (tailLength(newLength) === 0) {
		vec.root = appendLeafOntoTree(aft, vec.root, tailOffset(totalLength));
		vec.aft = null
	}
	vec.length = newLength;

	return vec;
}





/*
 * optimization strategy here is a form of loop unrolling, where instead
 * of looping all the way down to child-most node, we use a switch case
 * specific to depth of tree.
 */
function appendLeafOntoTree(leaf, tree, treeLen) {
	var newTree
		, d1
		, d2
		, d3
		, d4
		, d5
		, n1
		, n2
		, n3
		, n4
		, n5

	if (!tree || treeLen == 0) {
		return [leaf]
	}

	var depth = depthFromLength(treeLen);

	switch (depth) {
		case 1:
			return updateRoot(leaf, tree, true);

		case 2:
			d1 = aLast(tree)

			n1 = addNode(leaf, d1, true)
			return updateRoot(n1, tree, d1.length === 32)

		case 3:
			d2 = aLast(tree)
			d1 = aLast(d2)

			n1 = addNode(leaf, d1, true)
			n2 = addNode(n1, d2, d1.length == 32 )
			return updateRoot(n2, tree, n2.length === 1 && d2.length == 32)

		case 4:
			d3 = aLast(tree)
			d2 = aLast(d3)
			d1 = aLast(d2)

			n1 = addNode(leaf, d1, true)
			n2 = addNode(n1, d2, d1.length == 32 )
			n3 = addNode(n2, d3, n2.length === 1 && d2.length == 32)
			return updateRoot(n3, tree, n3.length == 1 && d3.length == 32)

		// we should consider removing below lines, as js is limited to max 2gb
		// an these length are likely to be in stack overflow range anyways
		case 5:
			d4 = aLast(tree)
			d3 = aLast(d4)
			d2 = aLast(d3)
			d1 = aLast(d2)

			n1 = addNode(leaf, d1, true)
			n2 = addNode(n1, d2, d1.length === 32 )
			n3 = addNode(n2, d3, n2.length === 1 && d2.length === 32)
			n4 = addNode(n3, d4, n3.length === 1 && d3.length === 32)
			return updateRoot(n4, tree, n4.length == 1 && d4.length == 32)

		case 6:
			d5 = aLast(tree)
			d4 = aLast(d5)
			d3 = aLast(d4)
			d2 = aLast(d3)
			d1 = aLast(d2)

			n1 = addNode(leaf, d1, true)
			n2 = addNode(n1, d2, d1.length === 32 )
			n3 = addNode(n2, d3, n2.length === 1 && d2.length === 32)
			n4 = addNode(n3, d4, n3.length === 1 && d3.length === 32)
			n5 = addNode(n4, d5, n4.length === 1 && d4.length === 32)
			return updateRoot(n5, tree, n5.length == 1 && d5.length == 32)
	}

}

function addNode(child, parent, shouldAppend) {
	if (shouldAppend) {
		return parent.length === 32 ? [child] : aPush(child, parent);
	}
	return aSet(parent.length - 1, child, parent)
}

function updateRoot(child, root, expand) {
	if (expand) {
		return root.length == 32 ? [root, [child]] : aPush(child, root);
	}
	return aSet(root.length - 1, child, root)
}

export function appendǃ(value, vec) {
	var aft = vec.aft
		, totalLength = vec.length
		, newLength = totalLength + 1

	if ((newLength) === 1073741824) {
		return IllegalHeight();
	}

	if (!aft) {
		aft = vec.aft = []
	}
	aft.push(value)

	if (tailLength(newLength) === 0) {
		vec.root = appendLeafOntoTree(aft, vec.root, tailOffset(totalLength));
		vec.aft = null
	}
	vec.length = newLength;

	return vec;
}

function appendLeafOntoTreeǃ(leaf, tree, treeLen) {
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

	if (!tree || treeLen == 0) {
		return [leaf]
	}

	var depth = depthFromLength(treeLen);

	switch (depth) {
		case 1:
			return updateRootǃ(leaf, tree, true);

		case 2:
			d1 = aLast(tree)

			n1 = addNodeǃ(leaf, d1, true)
			return updateRootǃ(n1, tree, d1.length === 32)

		case 3:
			d2 = aLast(tree)
			d1 = aLast(d2)

			n1 = addNodeǃ(leaf, d1, true)
			n2 = addNodeǃ(n1, d2, d1.length == 32 )
			return updateRootǃ(n2, tree, n2.length === 1 && d2.length == 32)

		case 4:
			d3 = aLast(tree)
			d2 = aLast(d3)
			d1 = aLast(d2)

			n1 = addNodeǃ(leaf, d1, true)
			n2 = addNodeǃ(n1, d2, d1.length == 32 )
			n3 = addNodeǃ(n2, d3, n2.length === 1 && d2.length == 32)
			return updateRootǃ(n3, tree, n3.length == 1 && d3.length == 32)

		// we should consider removing below lines, as js is limited to max 2gb
		// an these length are likely to be in stack overflow range anyways
		case 5:
			d4 = aLast(tree)
			d3 = aLast(d4)
			d2 = aLast(d3)
			d1 = aLast(d2)

			n1 = addNodeǃ(leaf, d1, true)
			n2 = addNodeǃ(n1, d2, d1.length === 32 )
			n3 = addNodeǃ(n2, d3, n2.length === 1 && d2.length === 32)
			n4 = addNodeǃ(n3, d4, n3.length === 1 && d3.length === 32)
			return updateRootǃ(n4, tree, n4.length == 1 && d4.length == 32)

		case 6:
			d5 = aLast(tree)
			d4 = aLast(d5)
			d3 = aLast(d4)
			d2 = aLast(d3)
			d1 = aLast(d2)

			n1 = addNodeǃ(leaf, d1, true)
			n2 = addNodeǃ(n1, d2, d1.length === 32 )
			n3 = addNodeǃ(n2, d3, n2.length === 1 && d2.length === 32)
			n4 = addNodeǃ(n3, d4, n3.length === 1 && d3.length === 32)
			n5 = addNodeǃ(n4, d5, n4.length === 1 && d4.length === 32)
			return updateRootǃ(n5, tree, n5.length == 1 && d5.length == 32)
	}

}

function addNodeǃ(child, parent, shouldAppend) {
	if (shouldAppend) {
		if (parent.length === 32)
			return[child];

		parent.push(child);
		return parent;
	}
	// parent[parent.length - 1] = child;
	return parent
}

function updateRootǃ(child, root, expand) {
	if (expand) {
		if (root.length == 32)
			return [root, [child]];

		root.push(child);
		return root;
	}
	// root[root.length - 1] = child;
	return root
}