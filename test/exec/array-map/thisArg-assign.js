const array = [1, 2];

function f(e, i, a) {
	return this.multiplier * e + i + a.length;
}

let results;
results = array.map(f, { multiplier: 2 });
