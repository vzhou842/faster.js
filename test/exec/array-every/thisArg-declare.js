const array = [1, 2];

function f(e) {
	return this.constant <= e;
}

const results = array.every(f, { constant: 2 });
