import {AppendAllTrait} from '../appendAll';
import {NthTrait} from '../nth';
import {TakeTrait} from '../take';
import {DropTrait} from '../drop';
import {createClass, DEPTHS} from './classUtil';
import {expect} from 'chai';

var Vector = createClass(AppendAllTrait, NthTrait, TakeTrait, DropTrait);


describe("eagle: appendAll tests", function() {

	describe('basic concat tests', function() {

		function testConcatWithLength(size, tOut = 2000) {
			it(`joins two lists of ${size} together`, function() {
				this.timeout(tOut);
				var vec = Vector.empty();

				for (var i = 0; size > i; i++) {
					vec = vec.append(i, vec);
				}

				var joined = vec.appendAll(vec, vec);
				expect(joined.length).to.equal(size * 2);

				for (var i = 0; size > i; i++) {
					expect(vec.nth(i, joined)).to.equal(i);
					expect(vec.nth(i + size, joined)).to.equal(i);
				}
			})
		}

		testConcatWithLength(32);
		testConcatWithLength(DEPTHS[1]);
		testConcatWithLength(DEPTHS[2]);
		testConcatWithLength(DEPTHS[3], 5000);
		// bigger than this is scary...


	});



	describe('advanced slice + concat churning', function() {
		function range(len) {
			var array = [];
			var vector = Vector.empty();
			for (var i = 0; len > i; i++) {
				array.push(i);
				vector = vector.appendǃ(i, vector)
			}
			return { array, vector }
		}

		function rand(max) {
			return Math.floor(Math.random() * max)
		}

		it('churn baby churn', function() {

			function sliceConcat(array, vector, len){
				var cut = rand(len / 2);

				var array = array.slice(cut).concat(array.slice(0, cut));

				var front = vector.take(cut, vector);
				var aft = vector.drop(cut, vector);
				var vector = vector.appendAll(aft, front);

				for (var i = 0; len > i; i++) {
					expect(vector.nth(i, vector)).to.equal(array[i], 'concat')
				}

				return { array, vector }
			}


			function run(len) {
				// var len = rand(SIZE);
				var len = 32;
				var { array, vector } = range(len);
				var count = 0;
				while (count++ < len) {
					var { array, vector } = sliceConcat(array, vector, len)
				}
			}

			/*
			for(var i = 0; i < 99999; i++){
				run(rand(SIZE)
			}
			/*/
			run(DEPTHS[0]);
			run(DEPTHS[1]);
			run(DEPTHS[2]);
			run(DEPTHS[3]);
			//*/



		})
	})


});