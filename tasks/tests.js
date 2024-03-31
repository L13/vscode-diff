//	Imports ____________________________________________________________________

const child_process = require('node:child_process');

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

module.exports = [
	{
		name: 'run',
		watch: 'test/**/*.js',
		task: (done) => {
			
			const tests = child_process.spawn('npm', ['test']).on('close', () => done());
			
			let logger = (buffer) => buffer.toString().split(/\n/).forEach((message) => message && console.log(message));
			
			tests.stdout.on('data', logger);
			tests.stderr.on('data', logger);
			
		},
	},
];

//	Functions __________________________________________________________________

