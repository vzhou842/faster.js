const array = [1, 2];

function f(acc, e, i, a) {
	return acc + e + i + a.length;
}

const a = 5, results = array.reduce(f);
