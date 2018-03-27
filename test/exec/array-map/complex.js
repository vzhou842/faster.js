const array = ['foo', 'bar', 'baz'];
let results;

function test() {
	const f = function(e) { return e.length; };
	results = array.map(e => f(e));
}
test();
