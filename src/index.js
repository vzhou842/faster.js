import optimizationInits from './optimizations';

export default function({ types: t }) {
	const optimizations = optimizationInits.map(f => f(t));

	const visitor = {};
	const visitorMethods = {};

	optimizations.forEach(o => {
		for (const key in o) {
			if (visitorMethods[key]) {
				visitorMethods[key].push(o[key]);
			} else {
				visitorMethods[key] = [o[key]];
			}
		}
	});

	for (const key in visitorMethods) {
		visitor[key] = function(path, state) {
			visitorMethods[key].forEach(f => f(path, state));
		};
	}

	return {
		visitor,
	};
}
