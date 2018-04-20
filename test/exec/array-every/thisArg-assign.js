const array = [1, 2];

function f(e) {
	return this.constant <= e;
}

let results;
results = array.every(f, { constant: 2 });
