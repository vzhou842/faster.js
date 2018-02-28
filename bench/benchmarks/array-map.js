const utils = require('../utils');

const mapFunc = element => Math.sqrt(element);

module.exports = {
	title: 'Array map',
	tests: [{
		title: '[native] arr.map()',
		run: () => {
			const arr = utils.randomArray();
			return arr.map(mapFunc);
		},
	}, {
		title: '[faster.js] for loop',
		run: () => {
			const arr = utils.randomArray();
			const result = [];

			for (let i = 0; i < arr.length; i++) {
				result.push(mapFunc(arr[i]));
			}

			return result;
		},
	}],
};
