const utils = require('../utils');

const randomIndex = arr => Math.floor(Math.random() * arr.length);

module.exports = {
	title: 'Array indexOf',
	tests: [{
		title: '[native] arr.indexOf()',
		run: () => {
			const arr = utils.randomArray();
			const index = randomIndex(arr);

			return arr.indexOf(arr[index]);
		},
	}, {
		title: '[faster.js] while loop',
		run: () => {
			const arr = utils.randomArray();
			const index = randomIndex(arr);
			const target = arr[index];

			let i = 0;
			let result = -1;
			while (i < arr.length) {
				if (arr[i] === target) {
					result = i;
					break;
				}
				i++;
			}

			return result;
		},
	}],
};
