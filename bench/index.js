const benchmark = require('benchmark');
const path = require('path');
const fs = require('fs');

benchmark.options.maxTime = 3;
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
		console.log(fastest.name + ' is ' + microsecDelta + 'μs faster than ' + slowest.name + '\n');
	});

	suite.run();
}

const benchmarksDir = path.join(__dirname, 'benchmarks')

fs.readdirSync(benchmarksDir)
	.map(file => require(path.join(benchmarksDir, file)))
	.forEach(runBenchmark);
