const array = [[1], [2]];

function f(acc, e) {
	return acc.concat(e);
}

let results;
results = array.reduceRight(f);
