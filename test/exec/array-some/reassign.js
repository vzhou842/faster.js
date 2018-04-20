const array = [1, 7, -2];

function f(e) {
	return e % 2 === 0;
}

let results = array;
results = results.some(f);
