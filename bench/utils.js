// Initialize the array caches used to quickly retrieve random arrays.
const arrayCaches = { small: [], medium: [], large: [] };

const randGen = () => Math.random();
for (let i = 0; i < 100; i++) {
	arrayCaches.small.push(Array.from({ length: 1 + Math.random() * 4 }, randGen));
	arrayCaches.medium.push(Array.from({ length: 10 + Math.random() * 40 }, randGen));
	arrayCaches.large.push(Array.from({ length: 100 + Math.random() * 400 }, randGen));
}

/**
 * Returns an array of random length with random contents.
 * @param {string} size - Either 'small', 'medium', or 'large'.
 */
function randomArray(size) {
	const cache = arrayCaches[size];
	return cache[Math.floor(Math.random() * cache.length)];
}

module.exports = {
	randomArray,
};
