//	Imports ____________________________________________________________________

import * as glob from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

//	Variables __________________________________________________________________

const mocha = new Mocha({
	ui: 'tdd',
	color: true
});

const files = glob.sync('**/*.test.js', {
	cwd: __dirname,
});

//	Initialize _________________________________________________________________

files.forEach((file) => mocha.addFile(path.resolve(__dirname, file)));

mocha.run((failures) => {
	
	//
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

