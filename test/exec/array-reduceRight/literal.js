function f(acc, e) {
	return acc.concat(e);
}

const results = [[1], [2, 0]].reduceRight(f);
