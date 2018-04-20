const array = [[1, 2], [3]];
const results = array.reduceRight(function(acc, e) {
	return acc.concat(e);
});
