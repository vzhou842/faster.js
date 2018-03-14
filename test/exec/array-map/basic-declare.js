const array = [1, 2];

function f(e, i, a) {
	return 2 * e + i + a.length;
}

const results = array.map(f);
