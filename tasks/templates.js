//	Imports ____________________________________________________________________

const file2json = require('../plugins/gulp-file2json');

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

module.exports = [
	{
		name: 'json',
		src: 'src/views/components/**/*.html',
		dest: 'src/views/components',
		watch: true,
		task: (stream) => {
	
			return stream
				.pipe(file2json({
					path: 'templates.ts',
					indent: '\t',
					template: '/* eslint-disable */\nexport default __CONTENT__;',
				}));
			
		},
	},
];

//	Functions __________________________________________________________________

