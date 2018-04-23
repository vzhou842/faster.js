const array = [[1], [2]];

function f(acc, e) {
	return acc.concat(e);
}

const a = 5, results = array.reduceRight(f);
