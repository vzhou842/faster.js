const array = [1, 7, -2];

function f(e) {
	return e % 2 === 1;
}

let results = array;
results = results.every(f);
