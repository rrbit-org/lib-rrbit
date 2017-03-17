
function VectorExample(length) {
	this.length = length;
}

export function factory(length) {
	return new VectorExample(length);
}


export function empty(factory) {
	var vec = factory(0);
	
	vec.root = null; // the tree structure
	vec.pre = null;  // transient front of list, optimized for fast prepends only(singly linked list)
	vec.aft = [];    // transient tail of list, optimized for fast appends only  (native array)
	vec.treeLength = 0;
	vec.treeDepth = 0;

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
}

export function of(value, factory) {
	var vec = factory(1);
	vec.aft.push(value);
	return vec;
}

export function clone(rrb, factory) {
	var vec = factory(rrb.length);

	vec.root =  rrb.root;
	vec.pre = rrb.pre;
	vec.aft = rbb.aft;
	vec.treeLength = rrb.treeLength;
	vec.treeDepth = rrb.treeDepth;

	return vec;
}