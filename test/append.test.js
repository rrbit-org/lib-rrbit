import {Cassowry} from '../src/index';
import {DEPTHS, pretty} from './testUtils';

// import expect from 'jest-matchers'

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

describe('immutable append tests', () => {
	function testSize(MAX) {
		it(`append ${pretty(MAX)} test`, () => {
			var vec = Cassowry.empty();

			for (var i = 0; MAX > i; i++) {
				vec = Cassowry.append(i, vec);
			}

			var NOT_FOUND = {notFound: true};

			for (var i = 0; MAX > i; i++) {
				expect(Cassowry.nth(i, vec, NOT_FOUND)).toEqual(i);
			}
		});
	}

	testSize(DEPTHS[0]);
	testSize(DEPTHS[1]);
	testSize(DEPTHS[2]);
	testSize(DEPTHS[3]);
	// testSize(DEPTHS[4])
	// testSize(DEPTHS[5])
});

describe.skip('mutable append tests', () => {
	function testSize(MAX) {
		it(`append ${pretty(MAX)} test`, () => {
			var vec = Cassowry.empty();

			for (var i = 0; MAX > i; i++) {
				vec = Cassowry.appendǃ(i, vec);
			}

			var NOT_FOUND = {notFound: true};

			for (var i = 0; MAX > i; i++) {
				expect(Cassowry.nth(i, vec, NOT_FOUND)).toEqual(i);
			}
		});
	}

	testSize(DEPTHS[0]);
	testSize(DEPTHS[1]);
	testSize(DEPTHS[2]); // about 500ms
	testSize(DEPTHS[3]); // about 13s
	// testSize(DEPTHS[4]) // about 7m
	// testSize(DEPTHS[5]) // out of memory
});
