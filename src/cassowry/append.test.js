import {CtorTrait} from './constructors'
import {append} from './append';
import {nth} from './nth'

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



describe('canary', () => {

	it('can create an empty List', () => {
		var vec = CtorTrait.empty()
	})
})

describe('immutable append tests', () => {
	function testSize(MAX) {
		it(`append ${pretty(MAX)} test`, () => {

			var vec = CtorTrait.empty()

			for (var i = 0; MAX > i; i++) {

				vec = append(i, vec);
			}

			var NOT_FOUND = {notFound: true}

			for (var i = 0; MAX > i; i++) {

				expect(nth(i, vec, NOT_FOUND)).toEqual(i)
			}

		});
	}

	testSize(DEPTHS[0])
	testSize(DEPTHS[1])
	testSize(DEPTHS[2])
	testSize(DEPTHS[3])
	// testSize(DEPTHS[4])
	// testSize(DEPTHS[5])
})


