const array = [[1, 3, -1], [0], [4, 5]];
let results;

function test() {
	const f = (acc, e, i, a) => acc.concat(e, i, a.length);
	results = array.reduceRight(function(acc, e, i, a) {
		return f(acc, e, i, a);
	}, [-999]);
}
test();
