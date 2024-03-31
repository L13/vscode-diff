//	Imports ____________________________________________________________________

const glob = require('glob');
const { ESLint } = require('eslint');
const rollup = require('rollup');

const typescript = require('@rollup/plugin-typescript');

//	Variables __________________________________________________________________

const commonScripts = [
	'src/@l13/**/!(*.test).ts',
	'src/@types/**/*.ts',
	'src/types.ts',
];

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

module.exports = [
	{
		name: 'lint',
		task: async (done) => {
	
			const eslint = new ESLint();
			const results = await eslint.lintFiles(['src/**/*.ts']);
			const formatter = await eslint.loadFormatter('stylish');
			const resultText = formatter.format(results);
			
			if (resultText) console.log(resultText);
			
			done();
			
		},
	},
	{
		name: 'services',
		watch: commonScripts.concat([
			'src/services/**/!(*.test).ts',
			'src/views/vscode.d.ts',,
		]),
		task: () => {
			
			return build({
				input: 'src/services/main.ts',
				file: 'out/extension.js',
				include: commonScripts.concat([
					'src/services/**/!(.test).ts',
					'src/views/vscode.d.ts',
				]),
				external: [
					'buffer',
					'child_process',
					'fs',
					'path',
					'vscode',
				],
			});
			
		},
	},
	{
		name: 'views',
		watch: commonScripts.concat([
			'src/views/**/!(*.test).ts',
		]),
		task: () => {
			
			return build({
				input: 'src/views/main.ts',
				file: 'media/main.js',
				format: 'iife',
				include: commonScripts.concat([
					'src/views/**/!(.test).ts',
				]),
			});
			
		},
	},
	{
		name: 'tests',
		watch: [
			'src/test/index.ts',
			'src/**/*.test.ts',
		],
		task: () => {
			
			const promises = [];
			
			[{ in: 'src/test/index.ts', out: 'test/index.js'}]
			.concat(createInOut('src/**/*.test.ts'))
			.forEach((file) => {
				
				promises.push(build({
					input: file.in,
					file: file.out,
					treeshake: false,
					include: [
						'src/@l13/**/*.ts',
						'src/@types/**/*.ts',
						'src/services/@l13/**/*.ts',
						'src/views/vscode.d.ts',
						'src/test/index.ts',
						'src/types.ts',
					],
					external: [
						'assert',
						'glob',
						'fs',
						'mocha',
						'path',
					],
				}));
				
			});
			
			return Promise.all(promises);
			
		},
	},
];

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

function build (config) {
	
	const external = config.external || [];
	
	return rollup.rollup({
		input: config.input,
		treeshake: config.treeshake ?? true,
		onwarn,
		external,
		plugins: [
			typescript({
				include: config.include,
			}),
		]
	}).then((bundle) => {
		
		return bundle.write({
			file: config.file,
			format: config.format || 'cjs',
			globals: config.globals || external.reduce((map, name) => {
				map[name] = name;
				return map;
			}, {}),
		});
		
	}, onerror);
	
}