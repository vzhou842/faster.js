const array = [1, 2];

function f(e, i, a) {
	return 2 * e + i + a.length;
}

let results;
results = array.map(f);
