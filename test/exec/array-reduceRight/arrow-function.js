const array = [[5, 3], [-1, 0], [-1, 0]];
const results = array.reduceRight((acc, e) => {
	return acc.concat(e);
});
