'use strict';

const array = utils.randomArray();
const results = [];

function f(e, i) {
	results.push({ e, i });
}

array.forEach(f);
