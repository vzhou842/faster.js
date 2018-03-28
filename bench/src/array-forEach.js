const array = utils.randomArray(ARRAY_SIZE);
const results = [];

array.forEach((e, i) => {
	results.push({ e, i });
});
