const array = [1, 2, 2, 4, -1];

function f(e, i, a) {
	return (e + i + a.length) % 2 === 0;
}

let results;
results = array.filter(f);
