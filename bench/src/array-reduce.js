const array = utils.randomArray(ARRAY_SIZE);

const results = array.reduce((acc, e, i) => acc + e + i, 0);
