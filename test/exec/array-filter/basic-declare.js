const array = [1, 2, 2, 4, 0];

function f(e, i, a) {
	return (e + i + a.length) % 2 === 0;
}

const results = array.filter(f);
