const results = utils.randomArray(ARRAY_SIZE)
	.reduce((acc, e, i) => acc + e + i, 0);
