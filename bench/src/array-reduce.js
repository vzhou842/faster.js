const array = utils.randomArray();

function f(acc, e, i) {
	return e + i;
}

const results = array.reduce(f, 0);
