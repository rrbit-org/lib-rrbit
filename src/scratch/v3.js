'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// common core for both forward and reverse iterating linked lists
function SingleLinkedList(data, len, next) {
	this.data = data;
	this.link = next;
	this.length = len;
}

function one(value) {
	return new SingleLinkedList(value, 1, null)
}

function add(value, list) {
	var len = list.length < 0 ? list.length - 1 : list.length + 1;
	return new SingleLinkedList(value, len, list)
}

function fromArray(arr) {
	if (!arr.length) return;
	var list = one(arr[0]);
	for (var i = 1, l = arr.length; l > i; i++) {
		list = add(arr[i], list);
	}
	return list;
}
function toArray(list) {
	var i = 0;
	var arr = new Array(list.length);

	while (list) {
		arr[i++] = list.data;
		list = list.link;
	}
	return arr;
}

/*
 *
 * 3 node types:
 * - leaf: contains only actual values.implemented using an array
 * - balanced:
 * - unbalanced:
 */

function PersistentVector(length) {
	this.length = length || 0;
	this.tail = null;
	this.front = null;
	this.root = [null, null];
	this.depth = 1;
	// this.startOffset = 0
	// in mutable mode, we use an array instead of a linkedlist
	// on tail/front as it's faster
	this.mutable = false;

	// in dirty mode, an immutable update is performed on a leaf, but the
	// parent trees are not updated to reference the new leaf. This enables
	// a performance gain when multiple updates occur back-to-back, but will
	// eventually require a normalization to reinsert that leaf into the tree
	// structure when full.
	this.dirty = false;
}

function empty() {
	return new PersistentVector(0);
}



function clone(src) {
	var vec = new PersistentVector(src.length);
	vec.root = src.root;
	vec.tail = src.tail;
	vec.front = src.front;
	vec.depth = src.depth;
	vec.dirty = !!src.dirty;
	vec.mutable = !!src.mutable;
	return vec;
}

// var onell = LinkedList.one;
// // var {add as addll, one as onell, toArray} = LinkedList;
// var toArray = LinkedList.toArray;
// var addll = LinkedList.add;

/**
 *
 * @param {T} value
 * @param {Vector<T>} rrb
 * @param {function} create
 * @return {*}
 */
function append(value, rrb, create) {
	var vec = clone(rrb);
	vec.length += 1;

	if (!vec.tail) {
		vec.tail = one(value);
		return vec;
	}

	if (vec.tail.length < 32) {
		vec.tail = add(value, vec.tail);
		return vec;
	}

	// assume tail is full and needs to be merged up
	addLeaf(toArray(vec.tail), rrb);
	vec.tail = one(value);
	return vec;
}

/**
 *
 * @param {T} value
 * @param {Vector<T>} rrb
 * @return {*}
 */
function appendǃ(value, rrb) {
	rrb.length += 1;

	if (!rrb.tail) {
		rrb.tail = [value];
		return rrb;
	}

	if (rrb.tail.length < 32) {
		rrb.tail.push(value);
		return rrb;
	}

	// assume tail is full and needs to be merged up
	addLeaf(rrb.tail, rrb);
	rrb.tail = [value];
	return rrb;
}

/**
 *
 * @param {Array<T>} leaf
 * @param {Vector<T>} rrb
 */
function addLeaf(leaf, rrb) {}

exports.empty = empty;
exports.append = append;
exports.appendǃ = appendǃ;
