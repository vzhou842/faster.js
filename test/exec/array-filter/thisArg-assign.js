const array = [1, 2, 2, 4, 0];

function f(e, i, a) {
	return (e + i + a.length) % 2 === this.val;
}

let results;
results = array.filter(f, { val: 0 });
