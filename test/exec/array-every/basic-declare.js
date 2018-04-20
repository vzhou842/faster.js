const array = [1, 2, 'test'];

function f(e) {
	return e % 2 === 1 || e instanceof String;
}

const results = array.every(f);
