function f(acc, e, i, a) {
	return acc + e + i + a.length;
}

const results = [1, 2].reduce(f);
