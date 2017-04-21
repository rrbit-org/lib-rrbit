import {Cassowry} from '../src/index';
import {DEPTHS, pretty} from './testUtils';

import expect from 'jest-matchers';

describe('initialization tests', () => {
	it('can create an empty List', () => {
		var vec = Cassowry.empty();
		expect(vec).toBeDefined();
		expect(vec.length).toBe(0);
		expect(vec.pre).toBe(null);
		expect(vec.aft).toBe(null);
		expect(vec.root).toBe(null);
	});
});

describe('immutable prepend tests', () => {
	function testSize(MAX) {
		it(`prepend ${pretty(MAX)} test`, () => {
			var vec = Cassowry.empty();

			var i = MAX;
			while (i--) {
				vec = Cassowry.prepend(i, vec);
			}

			var NOT_FOUND = {notFound: true};

			for (var i = 0; MAX > i; i++) {
				expect(Cassowry.nth(i, vec, NOT_FOUND)).toEqual(i);
			}
		});
	}

	testSize(DEPTHS[0]);
	testSize(DEPTHS[1]);
	// testSize(DEPTHS[2])
	// testSize(DEPTHS[3])
	// testSize(DEPTHS[4])
	// testSize(DEPTHS[5])
});
