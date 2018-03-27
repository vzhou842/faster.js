const array = [5, 3, 1];
const results = array.reduce((acc, e, i, a) => {
	return acc + e + i + a;
});
