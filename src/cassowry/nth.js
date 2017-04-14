
export function nth(i, list, notFound) {
	var tree = list.root
		, pre = list.pre
		, aft = list.aft
		, totalLength = list.length
		, preLen = ((pre && pre.length) || 0)

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
		return tree[i&31];
	if (treeLen <= 1024)
		return tree[(i >> 5)&31][i&31];
	if (treeLen <= 32768)
		return tree[(i >> 10)&31][(i >> 5)&31][i&31];
	if (treeLen <= 1048576)
		return tree[(i >> 15)&31][(i >> 10)&31][(i >> 5)&31][i&31];
	if (treeLen <= 1048576)
		return tree[(i >> 20)&31][(i >> 15)&31][(i >> 10)&31][(i >> 5)&31][i&31];
	if (treeLen <= 1048576)
		return tree[(i >> 25)&31][(i >> 20)&31][(i >> 15)&31][(i >> 10)&31][(i >> 5)&31][i&31];
	if (treeLen <= 33554432)
		return tree[(i >> 30)&31][(i >> 25)&31][(i >> 20)&31][(i >> 15)&31][(i >> 10)&31][(i >> 5)&31][i&31];

	return tree[(i >> 35)&31][(i >> 30)&31][(i >> 25)&31][(i >> 20)&31][(i >> 15)&31][(i >> 10)&31][(i >> 5)&31][i&31];
}

