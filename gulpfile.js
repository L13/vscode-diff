//	Imports ____________________________________________________________________

const child_process = require('child_process');
const del = require('del');
const fs = require('fs');
const glob = require('glob');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rollup = require('rollup');

const file2json = require('./plugins/gulp-file2json');
const typescript = require('@rollup/plugin-typescript');

//	Variables __________________________________________________________________

const findPattern = /width="100%" height="100%" viewBox="0 0 (\d+) (\d+)"/;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

gulp.task('clean', () => {
	
	return del(['.cache', 'media', 'out', 'test']);
	
});

gulp.task('icons:fix', (done) => {
	
	[
		'src/**/*.svg',
		'images/**/*.svg',
	].forEach((globPattern) => {
		
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
	
});

gulp.task('icons:common', () => {
	
	return gulp.src('src/views/icons/**/*.svg')
		.pipe(gulp.dest('media/icons'));
	
});

gulp.task('icons:json', () => {
	
	return gulp.src('src/views/components/icons/**/*.svg')
		.pipe(file2json({
			path: 'icons.ts',
			indent: '\t',
			template: '// tslint:disable\nexport default __CONTENT__;',
		}))
		.pipe(gulp.dest('src/views/components'));
	
});

gulp.task('icons', gulp.series('icons:fix', 'icons:common', 'icons:json'));

gulp.task('style:common', () => {
	
	return gulp.src('src/views/style.scss')
		.pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(gulp.dest('media'));
	
});

gulp.task('style:precompile', () => {
	
	return gulp.src('src/views/components/**/*.scss')
		.pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(gulp.dest('.cache/src/views/components'));
	
});

gulp.task('style:json', () => {
	
	return gulp.src('.cache/src/views/components/**/*.css')
		.pipe(file2json({
			path: 'styles.ts',
			indent: '\t',
			template: '// tslint:disable\nexport default __CONTENT__;',
		}))
		.pipe(gulp.dest('src/views/components'));
	
});

gulp.task('style', gulp.series('style:common', 'style:precompile', 'style:json'));

gulp.task('templates', () => {
	
	return gulp.src('src/views/components/**/!(index).html')
		.pipe(file2json({
			path: 'templates.ts',
			indent: '\t',
			template: '// tslint:disable\nexport default __CONTENT__;',
		}))
		.pipe(gulp.dest('src/views/components'));
	
});

gulp.task('script:view', () => {
	
	return rollup.rollup({
		input: 'src/views/main.ts',
		onwarn,
		plugins: [
			typescript({
				include: [
					'src/@l13/**/!(.test).ts',
					'src/@types/**/!(.test).ts',
					'src/views/**/!(.test).ts',
					'src/types.ts',
				],
			}),
		]
	}).then(bundle => {
		
		return bundle.write({
			file: 'media/main.js',
			format: 'iife',
		});
		
	}, onerror);
	
});

gulp.task('script:services', () => {
	
	return rollup.rollup({
		input: 'src/extension.ts',
		onwarn,
		external: [
			'child_process',
			'fs',
			'path',
			'vscode',
		],
		plugins: [
			typescript({
				include: [
					'src/@l13/**/!(.test).ts',
					'src/@types/**/!(.test).ts',
					'src/commands/**/!(.test).ts',
					'src/common/**/!(.test).ts',
					'src/services/**/!(.test).ts',
					'src/extension.ts',
					'src/types.ts',
				],
			}),
		]
	}).then(bundle => {
		
		return bundle.write({
			file: 'out/extension.js',
			format: 'cjs',
			globals: {
				child_process: 'child_process',
				fs: 'fs',
				path: 'path',
				vscode: 'vscode',
			},
		});
		
	}, onerror);
	
});

gulp.task('script:tests', () => {
	
	const promises = [];
	
	[{ in: 'src/test/index.ts', out: 'test/index.js'}]
	.concat(createInOut('src/**/*.test.ts'))
	.forEach((file) => {
		
		promises.push(rollup.rollup({
			input: file.in,
			treeshake: false,
			onwarn,
			external: [
				'assert',
				'glob',
				'fs',
				'mocha',
				'path',
			],
			plugins: [
				typescript({
					include: [
						'src/@l13/**/*.ts',
						'src/services/@l13/**/*.ts',
						'src/test/index.ts',
					],
				}),
			]
		}).then(bundle => {
			
			return bundle.write({
				file: file.out,
				format: 'cjs',
				globals: {
					assert: 'assert',
					glob: 'glob',
					fs: 'fs',
					mocha: 'mocha',
					path: 'path',
				},
			});
			
		}, onerror));
		
	});
	
	return Promise.all(promises);
	
});

gulp.task('test', (done) => {
	
	const tests = child_process.spawn('npm', ['test']).on('close', () => done());
	
	let logger = (buffer) => buffer.toString().split(/\n/).forEach((message) => message && console.log(message));
	
	tests.stdout.on('data', logger);
	tests.stderr.on('data', logger);
	
});

gulp.task('script', gulp.series('script:view', 'script:services', 'script:tests'));

gulp.task('build', gulp.series('clean', 'icons', 'style', 'templates', 'script', 'test'));

gulp.task('watch', () => {
	
	gulp.watch('src/views/**/*.svg', gulp.parallel('icons'));
	
	gulp.watch('src/views/**/*.scss', gulp.parallel('style'));
	
	gulp.watch('src/views/**/*.html', gulp.parallel('templates'));
	
	gulp.watch([
		'src/**/*.svg',
		'images/**/*.svg',
	], gulp.parallel('icons:fix'));
	
	gulp.watch([
		'src/@l13/**/!(*.test).ts',
		'src/@types/**/*.ts',
		'src/types.ts',
		'src/views/**/!(*.test).ts',
	], gulp.parallel('script:view'));
	
	gulp.watch([
		'src/@l13/**/!(*.test).ts',
		'src/@types/**/*.ts',
		'src/extension.ts',
		'src/types.ts',
		'src/commands/**/!(*.test).ts',
		'src/common/**/!(*.test).ts',
		'src/services/**/!(*.test).ts',
	], gulp.parallel('script:services'));
	
	gulp.watch([
		'src/test/index.ts',
		'src/**/*.test.ts',
	], gulp.series('script:tests', 'test'));
	
});

gulp.task('build & watch', gulp.series('build', 'watch'));

//	Functions __________________________________________________________________

function createInOut (pattern) {
	
	return glob.sync(pattern).map((filename) => {
		
		return {
			in: filename,
			out: filename.replace(/^src/, 'test').replace(/\.ts$/, '.js'),
		};
		
	});
	
}

function onwarn (warning) {
	
	console.warn(warning.toString());
	
}

function onerror (error) {
	
	console.error(`Error:${error.pluginCode ? ' ' + error.pluginCode : ''} ${error.message} ${error.loc.file}:${error.loc.line}:${error.loc.column}`);
	
	throw error;
	
}