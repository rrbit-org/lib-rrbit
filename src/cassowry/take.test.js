import {Cassowry} from './index'
import {DEPTHS, range} from './testUtils'

import expect from 'jest-matchers'


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

			var sum = Cassowry.reduce((sum, value) => {
				expect(sum).toEqual(value);
				return sum + 1
			}, 0, vec)

			expect(sum).toEqual(vec.length, 'sum was not as expected')
		})
	}

	testSize(size[0], size[0].length / 2)
	testSize(size[1], size[1].length / 2)
	testSize(size[2], size[2].length / 2)
	testSize(size[3], size[3].length / 2)
})