const array = [1, 2];

function f(e) {
	return this.constant > e;
}

let results;
results = array.some(f, { constant: 2 });
