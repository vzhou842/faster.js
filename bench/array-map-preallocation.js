const benchmark = require('benchmark');
const utils = require('./utils');

benchmark.options.onAbort = event => console.error(event.currentTarget.error);

['small', 'medium', 'large'].forEach(arraySize => {
	const suite = new benchmark.Suite();
	const title = `array-map-preallocation ${arraySize}`;

	suite.add('without preallocation', () => {
		const _defined = utils.randomArray(arraySize);
		const _defined2 = (e, i) => e + i;
		const results = [];
		for (let _i = 0; _i <= _defined.length - 1; _i++) {
		  results.push(_defined2(_defined[_i], _i, _defined));
		}
	});
	suite.add('with preallocation', () => {
		const _defined = utils.randomArray(arraySize);
		const _defined2 = (e, i) => e + i;
		const results = new Array(_defined.length);
		for (let _i = 0; _i <= _defined.length - 1; _i++) {
		  results[_i] = _defined2(_defined[_i], _i, _defined);
		}
	});

	suite.on('start', () => console.log('  ' + title));
	suite.on('cycle', event => console.log("    ✓ " + event.target));
	suite.on('complete', function() {
		const slowest = this.filter('slowest')[0];
		const fastest = this.filter('fastest')[0];
		const microsecDelta = ((1000000 / slowest.hz) - (1000000 / fastest.hz)).toFixed(3);
		const percentFaster = (100 * (fastest.hz - slowest.hz) / slowest.hz).toFixed(1);
		console.log(fastest.name + ' is ' + percentFaster + '% faster (' + microsecDelta + 'μs) than ' + slowest.name + '\n');
	});

	suite.run();
});
