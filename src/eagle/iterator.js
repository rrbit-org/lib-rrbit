import {TreeTrait} from './shared/tree';

export function iterator(start, end, rrb) {
	var len = rrb.length;
	if (typeof start == 'undefined')
		start = 0;

	if (typeof end == 'undefined')
		end = len;

	if (0 > end) //if negative
		end += len;

	if (0 > start)
		start += len;

	if (start > end)
		return create(0);

	return new RangedIterator(start, end, rrb);
}

function RangedIterator(startIndex, endIndex, rrb) {
	// do no validation of inputs here, keep it fast. use a helper/wrapper if needed

	// only create varue object once for performance
	this.NEXT = { value: null, done: false};
	this.startIndex = startIndex;

	if (rrb.transient) {
		this.normalize(rrb.depth, rrb)
		rrb.transient = false;
	}

	this.copyFocus(rrb, this)

	if (startIndex < endIndex) {
		this._hasNext = true;
		this.focusOn(startIndex, this);

		this.blockIndex = this.focusStart + (this.focus & -32);
		this.lo = this.focus & 31
		if (startIndex < this.focusEnd) {
			this.focusEnd = endIndex;
		}
		this.endLo = Math.min(this.focusEnd - this.blockIndex, 32);
	} else {
		this.blockIndex = 0
		this.lo = 0;
		this.endLo = 1;
		this.display0 = []
	}
}

Object.assign(RangedIterator.prototype, TreeTrait);

RangedIterator.prototype.next = function next() {
	// todo: off by one here, last element should get done = true?
	// if (!this._hasNext) {
	// 	this.NEXT.done = true;
	// 	return this.NEXT;
	// }

	var next = this.NEXT;
	next.value = this.display0[this.lo];
	this.lo++;
	if (this.lo == this.endLo)
		this.goToNextBlock();

	if (!this._hasNext)
		next.done = true;

	return next;
}

RangedIterator.prototype.goToNextBlock = function nextBlock() {
	var oldBlockIndex = this.blockIndex
	var newBlockIndex = oldBlockIndex + this.endLo
	this.blockIndex = newBlockIndex
	this.lo = 0
	var _focusEnd = this.focusEnd
	if (newBlockIndex < _focusEnd) {
		var _focusStart = this.focusStart
		var newBlockIndexInFocus = newBlockIndex - _focusStart
		this.gotoNextBlockStart(newBlockIndexInFocus, newBlockIndexInFocus ^ (oldBlockIndex - _focusStart), this)
		this.endLo = Math.min(_focusEnd - newBlockIndex, 32)
		return
	} else {
		var _length = this.length
		if (newBlockIndex < _length) {
			this.focusOn(newBlockIndex, this)
			if (_length < this.focusEnd)
				this.focusEnd = _length
			this.endLo = Math.min(this.focusEnd - newBlockIndex, 32)
		} else {
			/* setup dummy index that will not fail in subsequent 'next()' invocations */
			this.lo = 0
			this.blockIndex = _length
			this.endLo = 1
			this._hasNext = false
		}
	}
};

RangedIterator.prototype.gotoNextBlockStart = function gotoNextBlockStart(index, xor, rrb) {
	if (xor < 1024) {
		rrb.display0 = rrb.display1[(index >> 5) & 31]
	} else if (xor < 32768) {
		var d1 = rrb.display2[(index >> 10) & 31]
		rrb.display1 = d1
		rrb.display0 = d1[0]
	} else if (xor < 1048576) {
		var d2 = rrb.display3[(index >> 15) & 31]
		var d1 = d2[0]
		rrb.display0 = d1[0]
		rrb.display1 = d1
		rrb.display2 = d2
	} else if (xor < 33554432) {
		var d3 = rrb.display4[(index >> 20) & 31]
		var d2 = d3[0]
		var d1 = d2[0]
		rrb.display0 = d1[0]
		rrb.display1 = d1
		rrb.display2 = d2
		rrb.display3 = d3
	} else if (xor < 1073741824) {
		var d4 = rrb.display5[(index >> 25) & 31]
		var d3 = d4[0]
		var d2 = d3[0]
		var d1 = d2[0]
		rrb.display0 = d1[0]
		rrb.display1 = d1
		rrb.display2 = d2
		rrb.display3 = d3
		rrb.display4 = d4
	}
};

RangedIterator.prototype.copyFocus = function copyFocus(src, dest) {
	dest.focus = src.focus;
	dest.focusStart = src.focusStart;
	dest.focusEnd = src.focusEnd;
	dest.focusDepth = src.focusDepth;
	dest.focusRelax = src.focusRelax;
	dest.display0 = src.display0;
	dest.display1 = src.display1;
	dest.display2 = src.display2;
	dest.display3 = src.display3;
	dest.display4 = src.display4;
	dest.display5 = src.display5;

	dest.depth = src.depth;
	dest.length = src.length;
	dest.transient = src.transient;
};