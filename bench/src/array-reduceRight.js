const results = utils.randomArray(ARRAY_SIZE)
	.reduceRight((acc, e, i) => acc + e + i, 0);
