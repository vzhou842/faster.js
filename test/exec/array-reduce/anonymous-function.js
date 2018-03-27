const array = [1, 3];
const results = array.reduce(function(acc, e, i, a) {
	return acc + e + i + a;
});
