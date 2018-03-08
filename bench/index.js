const benchmark = require('benchmark');
const path = require('path');
const fs = require('fs');
const commandLineArgs = require('command-line-args');

const options = commandLineArgs([{
	name: 'benchmarks',
	alias: 'b',
	type: String,
	multiple: true,
	description: 'The benchmarks to run. If not supplied, all benchmarks will be run.',
}, {
	name: 'timeout',
	alias: 't',
	type: Number,
	description: 'The max time allowed per test.',
}]);

benchmark.options.maxTime = options.timeout || 3;
benchmark.options.onAbort = event => console.error(event.currentTarget.error);

function runBenchmark(b) {
	const suite = new benchmark.Suite();

	b.tests.forEach(test => {
		suite.add(test.title, test.run);
	});

	suite.on('start', () => console.log('  ' + b.title));
	suite.on('cycle', event => console.log("    ✓ " + event.target));
	suite.on('complete', function() {
		const slowest = this.filter('slowest')[0];
		const fastest = this.filter('fastest')[0];
		const microsecDelta = ((1000000 / slowest.hz) - (1000000 / fastest.hz)).toFixed(3);
		const percentFaster = (100 * (fastest.hz - slowest.hz) / slowest.hz).toFixed(1);
		console.log(fastest.name + ' is ' + percentFaster + '% faster (' + microsecDelta + 'μs) than ' + slowest.name + '\n');
	});

	suite.run();
}

const benchmarksDir = path.join(__dirname, 'benchmarks');

fs.readdirSync(benchmarksDir)
	.map(file => file.replace('.js', ''))
	.filter(file => !options.benchmarks || options.benchmarks.includes(file))
	.map(file => require(path.join(benchmarksDir, file)))
	.forEach(runBenchmark);
