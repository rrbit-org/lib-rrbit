import {Cassowry} from '../src/index';
import {DEPTHS, range} from './testUtils';

import expect from 'jest-matchers';

describe('update', () => {
	it('1000 > 500', () => {
		var vec = range(1000);

		vec = Cassowry.update(500, 'boo!', vec);
		expect(vec.length).toEqual(1000);

		for (var i = 0; 1000 > i; i++) {
			if (i == 500) expect(Cassowry.nth(i, vec)).toEqual('boo!');
			else expect(Cassowry.nth(i, vec)).toEqual(i);
		}
	});

	it('updates sliced vectors', () => {
		// ensure we have a pre, root, aft and originOffset
		var vec = range(1000);
		vec = Cassowry.drop(3, vec)
		vec = Cassowry.prepend(2, vec)
		vec = Cassowry.prepend(1, vec)
		vec = Cassowry.prepend(0, vec)

		var vec1 = Cassowry.update(1, 'boo!', vec);
		var vec500 = Cassowry.update(500, 'boo!', vec);
		var vec999 = Cassowry.update(999, 'boo!', vec);
		expect(vec1.length).toEqual(1000);
		expect(vec500.length).toEqual(1000);
		expect(vec999.length).toEqual(1000);

		for (var i = 0; 1000 > i; i++) {
			if (i == 1) expect(Cassowry.nth(i, vec1)).toEqual('boo!');
			else expect(Cassowry.nth(i, vec1)).toEqual(i);

			if (i == 500) expect(Cassowry.nth(i, vec500)).toEqual('boo!');
			else expect(Cassowry.nth(i, vec500)).toEqual(i);

			if (i == 999) expect(Cassowry.nth(i, vec999)).toEqual('boo!');
			else expect(Cassowry.nth(i, vec999)).toEqual(i);
		}
	});
});
