const utils = require('../utils');

module.exports = {
	title: 'Array concat',
	tests: [{
		title: '[native] arr.concat()',
		run: () => {
			let arr = [];
			arr = arr.concat(utils.randomArray());
		},
	}, {
		title: '[faster.js] Array.prototype.push.apply()',
		run: () => {
			const arr = [];
			Array.prototype.push.apply(arr, utils.randomArray());
		},
	}],
};
