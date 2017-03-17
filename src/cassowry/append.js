import {clone} from './constructors'

export function append(value, rrb, factory) {
	var vec = clone(rrb);
	var aft = vec.aft;

	// need to determine best way to calc offset here, as aft may be 
	// shared past the offset length
	var aftDelta = (vec.length - vec.treeLength);
	if (aftDelta != aft.length) {
		// another vector is sharing our aft
		vec.aft = aft.slice(0, aftDelta)
	}

	if (vec.aft.length < 32) {
		vec.length++;
		vec.push(value)
	} else {
		pullAftIntoTree(vec);
		vec.aft = [value]
	}
	
	return vec;
}

function pullAftIntoTree(rrb) {}