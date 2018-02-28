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
		title: '[faster.js] for loop',
		run: () => {
			const arr = utils.randomArray();
			const index = randomIndex(arr);
			const target = arr[index];

			let result = -1;
			for (let i = 0; i < arr.length; i++) {
				if (arr[i] === target) {
					result = i;
					break;
				}
			}

			return result;
		},
	}],
};
