import optimizationInits from './optimizations';

export default function({ types: t }) {
	const optimizations = optimizationInits.map(f => f(t));

	const visitor = {};
	const visitorMethods = {};

	// Split each optimization into its visitor methods and group
	// visitor methods together by name.
	optimizations.forEach(o => {
		for (const key in o) {
			if (visitorMethods[key]) {
				visitorMethods[key].push(o[key]);
			} else {
				visitorMethods[key] = [o[key]];
			}
		}
	});

	// Define the visitor methods, which call all optimization
	// methods found with that name.
	for (const key in visitorMethods) {
		visitor[key] = function(path, state) {
			visitorMethods[key].forEach(f => f(path, state));
		};
	}

	return {
		visitor,
	};
}
