import { transform } from 'babel-core';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import fasterjs from '../src';

describe('Execution Tests', () => {
	const execDir = path.join(__dirname, 'exec');
	const folders = fs.readdirSync(execDir).filter(n => n[0] !== '.');

	function wrap(code) {
		return new Function(`${code}\nreturn results;`);
	}

	function testFolder(folder) {
		const folderDir = path.join(execDir, folder);
		const inputNames = fs.readdirSync(folderDir);
		const inputs = inputNames.map(n => fs.readFileSync(path.join(folderDir, n)));

		inputs.forEach((input, i) => {
			it(inputNames[i].replace('.js', ''), () => {
				const original = wrap(input);
				const { code } = transform(input, { babelrc: false, plugins: [fasterjs] });
				const transformed = wrap(code);
				assert.deepStrictEqual(original(), transformed());
			});
		});
	}

	folders.forEach(folder => {
		describe(folder, testFolder.bind(null, folder))
	});
});