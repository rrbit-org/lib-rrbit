import {Cassowry} from './index'

import expect from 'jest-matchers'

var DEPTHS = [
	32, // 0 depth (leaf only) (32 ** 1)
	1024, // 1 depth (default min depth) (32 ** 2)
	32768, // 2 depth (32 ** 3)
	1048576, // 3 depth (1M) (32 ** 4)
	33554432, // 4 depth (33.5M) (32 ** 5)
	1073741824 // 5 depth (1B) (32 ** 6) usually will cause out-of-memory by this point in current JS engines
];

function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



describe('initialization tests', () => {

	it('can create an empty List', () => {
		var vec = Cassowry.empty()
		expect(vec).toBeDefined()
		expect(vec.length).toBe(0)
		expect(vec.pre).toBe(null)
		expect(vec.aft).toBe(null)
		expect(vec.root).toBe(null)

	})
})

describe('immutable prepend tests', () => {
	function testSize(MAX) {
		it(`append ${pretty(MAX)} test`, () => {

			var vec = Cassowry.empty()

			var i = MAX
			while (i--) {

				vec = Cassowry.prepend(i, vec);
			}

			var NOT_FOUND = {notFound: true}

			for (var i = 0; MAX > i; i++) {

				expect(Cassowry.nth(i, vec, NOT_FOUND)).toEqual(i)
			}

		});
	}

	// testSize(DEPTHS[0])
	// testSize(DEPTHS[1])
	testSize(DEPTHS[2])
	// testSize(DEPTHS[3])
	// testSize(DEPTHS[4])
	// testSize(DEPTHS[5])
})

