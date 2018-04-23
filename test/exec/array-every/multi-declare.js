const array = [1, 2, 'test'];

function f(e) {
	return e % 2 === 1 || e instanceof String;
}

const a = 5, results = array.every(f);
