//	Imports ____________________________________________________________________

const fs = require('node:fs');

const glob = require('glob');

const file2json = require('../plugins/gulp-file2json');

//	Variables __________________________________________________________________

const findPattern = /width="100%" height="100%" viewBox="0 0 (\d+) (\d+)"/;

const iconPaths = [
	'src/**/*.svg',
	'images/**/*.svg',
];

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

module.exports = [
	{
		name: 'fix',
		watch: iconPaths,
		task: (done) => {
	
			iconPaths.forEach((globPattern) => {
				
				glob.sync(globPattern).forEach((filename) => {
					
					let content = fs.readFileSync(filename, 'utf-8');
					
					if (findPattern.test(content)) {
						content = content.replace(findPattern, (match, width, height) => {
							
							return `width="${width}px" height="${height}px" viewBox="0 0 ${width} ${height}"`;
							
						});
						fs.writeFileSync(filename, content, 'utf-8');
					}
					
				});
				
			});
			
			done();
			
		},
	},
	{
		name: 'media',
		src: 'src/views/icons/panel/**/*.svg',
		dest: 'media/icons',
		watch: true,
	},
	{
		name: 'json',
		src: 'src/views/icons/components/**/*.svg',
		dest: 'src/views/components',
		watch: true,
		task: (stream) => {
	
			return stream
				.pipe(file2json({
					path: 'icons.ts',
					indent: '\t',
					template: '/* eslint-disable */\nexport default __CONTENT__;',
				}));
			
		},
	}
];

//	Functions __________________________________________________________________

