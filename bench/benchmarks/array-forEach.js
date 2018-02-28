const utils = require('../utils');

let helperVar = 0;
const forEachFunc = element => {
	helperVar = Math.sqrt(element);
};

module.exports = {
	title: 'Array forEach',
	tests: [{
		title: '[native] arr.forEach()',
		run: () => {
			const arr = utils.randomArray();
			arr.forEach(forEachFunc);
		},
	}, {
		title: '[faster.js] for loop',
		run: () => {
			const arr = utils.randomArray();
			for (let i = 0; i < arr.length; i++) {
				forEachFunc(arr[i]);
			}
		},
	}],
};
