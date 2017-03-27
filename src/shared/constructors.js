/*
 * notes:
 *
 * # Node types
 * there are 3 node types
 *  - leaf nodes, containing concrete values. never > 32 length
 *  - balanced nodes are full parents, they are identified by the last item being null
 *  - unbalanced nodes are partially full parents
 *    for efficiency, unbalanced nodes have metadata on the sizes of it's children
 *    the last item in these arrays is the "sizes" array(unlike the paper, where it's the first)
 *    the sizes array has the same length as the number of children
 *
 * since it is possible to represent trees that are not filled on the left(using sizes ?)
 * the "startIndex" offset is removed, length however is still used
 *
 */


// export type Node<T> = Array<Array<T | Node<T> | number>>
//
// export type Vector<T> = {
// 	length: number,
// 	focus: number,
// 	focusEnd: number,
// 	focusStart: number,
// 	focusDepth: number,
// 	depth: 1|2|3|4|5|6,
// 	display0: Array<T>,
// 	display1: ?Node<T>,
// 	display2: ?Node<T>,
// 	display3: ?Node<T>,
// 	display4: ?Node<T>,
// 	display5: ?Node<T>
// }
//
// type Factory = <T>(length: number) => Vector<T>

function DummyVector(len) {
	this.length = len;
}


export function mixin(base) {
	for (var key in CtorTrait) {
		base[key] = CtorTrait[key];
	}
	return base;
}

export function setupAsClass(Class, factory) {
	Class.factory = factory;
	Class.empty = CtorTrait.empty;

	Class.prototype.factory = factory;
	Class.prototype.empty = CtorTrait.empty;

	Class.prototype.fromFocusOf = CtorTrait.fromFocusOf;
	return Class;
}

export var CtorTrait = {
	factory: function(len) {
		// example: return new MyVector(len)
		// must return an object with a "length" property

		throw new Error('please override make() with your factory function')
	},
	empty() {
		var vec = this.factory(0);
		vec.focus = 0;
		vec.focusEnd = 0;
		vec.focusStart = 0;
		vec.focusDepth = 1;
		vec.focusRelax = 0;
		vec.display0 = [];
		vec.display1 = null;
		vec.display2 = null;
		vec.display3 = null;
		vec.display4 = null;
		vec.display5 = null;
		vec.transient = false;
		vec.depth = 1;
		return vec;
	},

	fromFocusOf(src) {
		var vec = this.factory(src.length);
		vec.length = src.length;
		vec.focusStart = src.focusStart;
		vec.focusDepth = src.focusDepth;
		vec.focusRelax = src.focusRelax;
		vec.focusEnd = src.focusEnd;
		vec.focus = src.focus;
		vec.depth = src.depth;
		vec.transient = false;
		vec.display0 = src.display0;
		vec.display1 = src.display1;
		vec.display2 = src.display2;
		vec.display3 = src.display3;
		vec.display4 = src.display4;
		vec.display5 = src.display5;
		return vec;
	}

}