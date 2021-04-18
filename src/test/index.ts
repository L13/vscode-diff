//	Imports ____________________________________________________________________

import * as path from 'path';
import * as glob from 'glob';
import Mocha from 'mocha';

//	Variables __________________________________________________________________

const mocha = new Mocha({
	ui: 'tdd',
	color: true,
});

const files = glob.sync('**/*.test.js', {
	cwd: __dirname,
});

//	Initialize _________________________________________________________________

files.forEach((file) => mocha.addFile(path.resolve(__dirname, file)));

mocha.run(() => {
	
	//
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

