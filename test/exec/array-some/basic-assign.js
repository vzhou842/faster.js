const array = [1, 2, 'test'];

function f(e) {
	return e % 2 === 0 || e instanceof String;
}

let results;
results = array.some(f);
