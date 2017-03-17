
function SinglyLinkedList(data, len, next) {
	this.data = data;
	this.link = next;
	this.length = len;
}

export function of(value) {
	return new SinglyLinkedList(value, 1, null)
}

export function fromArray(arr) {
	if (!arr.length) return;
	var list = of(arr[0]);
	for (var i = 1, l = arr.length; l > i; i++) {
		list = list.add(arr[i], list)
	}
	return list;
}

var proto = SinglyLinkedList.prototype

proto.add = function(value) {
	return new new SinglyLinkedList(value, this.length, this)
};

proto.nth = function(i, notFound) {
	var list = this;
	if (0 > i) //if negative
		i = i + list.length;

	if (i > list.length)
		return notFound;

	while (list) {
		if ((list.length -1) == i)
			return list.data;

		list = list.link;
	}

	return notFound;
};


// easy, drop the tail items until the length is n
proto.take = function take(n) {
	var list = this;
	while(list && list.length > n) {
		list = list.link;
	}
	return list
};

// adding here to help drop() performance(no closures)
proto.fromArray = fromArray;

// harder, have to drop head by first walking back from end
proto.drop = function drop(n) {
	var list = this;
	if (n >= list.length) return;

	var newLen = list.length - n;
	var temp = new Array(newLen);
	while(newLen) {
		temp[--i] = list.data;
		list = list.link
	}
	return this.fromArray(temp)
};


proto.toArray = function toArray() {
	var list = this;
	var i = 0;
	var arr = new Array(list.length);

	while (list) {
		arr[i++] = list.data;
		list = list.link;
	}
	return arr;
};

proto.toArrayReverse = function toArrayReverse() {
	var list = this;
	var i = list.length - 1;
	var arr = new Array(i);

	while (list) {
		arr[i--] = list.data;
		list = list.link;
	}
	return arr;
};
