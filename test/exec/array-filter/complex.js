const array = ['a', 'bar', 'baz', '22'];
let results;

function test() {
	const f = function(s) { return s.length >= 2; };
	results = array.filter(e => f(e));
}
test();
