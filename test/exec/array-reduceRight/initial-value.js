const array = [[1], [2, 3]];

function f(acc, e) {
	return acc.concat(e);
}

const results = array.reduceRight(f, [-1]);
