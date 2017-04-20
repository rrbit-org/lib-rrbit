import {Cassowry} from './index'
import {DEPTHS, range} from './testUtils'

import expect from 'jest-matchers'





describe('update', () => {
	it('1000 > 500', () => {
		var vec = range(1000);

		
		vec = Cassowry.update(500, "boo!", vec);
		expect(vec.length).toEqual(1000);

		for (var i = 0; 1000 > i; i++) {
			if (i == 500)
				expect(Cassowry.nth(i, vec)).toEqual('boo!')
			else
				expect(Cassowry.nth(i, vec)).toEqual(i)
		}
	})

})


