const array = ['foo', -1, 'bar', 'baz', 2];
const results = [];

function test() {
	const x = 5;
	array.forEach((e, i) => results.push({ x, e, i }));
}
test();
