const array = [1, 3, -1];
let results;

function test() {
	const f = (acc, e, i, a) => acc + e + i + a;
	results = array.reduce(function(acc, e, i, a) {
		return f(acc, e, i, a);
	}, -5);
}
test();
