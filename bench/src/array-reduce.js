const array = utils.randomArray();

const results = array.reduce((acc, e, i) => acc + e + i, 0);
