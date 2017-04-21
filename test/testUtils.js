import {Cassowry} from '../src/index';

export const DEPTHS = [
	32, // 0 depth (leaf only) (32 ** 1)
	1024, // 1 depth (default min depth) (32 ** 2)
	32768, // 2 depth (32 ** 3)
	1048576, // 3 depth (1M) (32 ** 4)
	33554432, // 4 depth (33.5M) (32 ** 5)
	1073741824 // 5 depth (1B) (32 ** 6) usually will cause out-of-memory by this point in current JS engines
];

export function range(size) {
	var vec = Cassowry.empty();

	for (var i = 0; size > i; i++) {
		vec = Cassowry.append(i, vec);
	}
	return vec;
}

export function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
