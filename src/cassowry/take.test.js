import {Cassowry} from './index'
import {DEPTHS, range} from './testUtils'

// import expect from 'jest-matchers'


var size = [
	range(DEPTHS[0])
	, range(DEPTHS[1])
	, range(DEPTHS[2])
	, range(DEPTHS[3])
	// , range(DEPTHS[4])
	// , range(DEPTHS[5])
]


describe('take tests', () => {

	function testSize(list, take) {

		it(`can take ${take} from ${list.length}`, () => {
			var vec = Cassowry.take(take, list)

			var NOT_FOUND = {notFound: true}

			expect(vec.length).toEqual(take)

			for (var i = 0; take > i; i++) {

				expect(Cassowry.nth(i, vec, NOT_FOUND)).toEqual(i)
			}
		})
	}

	testSize(size[0], size[0].length / 2)
	testSize(size[1], size[1].length / 2)
	testSize(size[2], size[2].length / 2)
	testSize(size[3], size[3].length / 2)
})