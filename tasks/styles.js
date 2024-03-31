//	Imports ____________________________________________________________________

const sass = require('gulp-sass')(require('sass'));

const file2json = require('../plugins/gulp-file2json');

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

module.exports = [
	{
		name: 'common',
		src: 'src/views/style.scss',
		dest: 'media',
		watch: true,
		task: (stream) => {
	
			return stream
				.pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError));
			
		},
	},
	{
		name: 'precompile',
		src: 'src/views/components/**/*.scss',
		dest: '.cache/src/views/components',
		watch: true,
		task: (stream) => {
	
			return stream
				.pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError));
			
		},
	},
	{
		name: 'json',
		src: '.cache/src/views/components/**/*.css',
		dest: 'src/views/components',
		watch: true,
		task: (stream) => {
	
			return stream
				.pipe(file2json({
					path: 'styles.ts',
					indent: '\t',
					template: '/* eslint-disable */\nexport default __CONTENT__;',
				}));
			
		},
	}
];

//	Functions __________________________________________________________________

