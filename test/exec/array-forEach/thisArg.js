const array = [1, 2];
const results = [];

function f(e) {
	this.arr.push(e);
}

array.forEach(f, { arr: results });
