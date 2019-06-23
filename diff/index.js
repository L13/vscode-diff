//	Imports ____________________________________________________________________

const fs = require('fs');
const path = require('path');

//	Variables __________________________________________________________________

const findArg = /^\-/;
const trimOption = /^\-\-/;

const args = process.argv.slice(2);

let action = '';
let values = [];

const manual = `
USAGE: node ${path.basename(__filename)} [OPTIONS]

OPTIONS

    --clean           Remove all files and folders from the root folder.

    --create          Create a set of files and folders for testing.

    --create-all      Create all sets of files and folders for testing.

`;

//	Initialize _________________________________________________________________

function optionName (args) {
	
	return args.shift().replace(trimOption, '');
	
}

function parseOptions (args, values = []) {
	
	const action = optionName(args);
	
	while (args.length && !findArg.test(args[0])) values.push(args.shift());
	
	return [action, values];
	
}

params: while (args.length) {
	switch (args[0]) {
		case '--help': console.log(manual); process.exit(); break params;
		case '--': args.shift(); break params;
		case '--clean': removeFilesAndFolders(path.join(__dirname, 'test')); args.shift(); break;
		case '--create': [action, values] = parseOptions(args); break;
		case '--create-all': action = 'all'; args.shift(); break;
		default: console.error(`Option '${args[0]}' does not exist\n${manual}`); process.exit(); break params;
	}
}

switch (action) {
	case 'create':
		let value;
		while ((value = values.shift())) {
			createFilesAndFolders(path.join(__dirname, 'test', value), require(path.join(__dirname, 'patterns', value)));
		}
		break;
	case 'all':
		const files = fs.readdirSync(path.join(__dirname, 'patterns'));
		files.forEach((value) => {
			
			value = path.basename(value, '.json');
			
			createFilesAndFolders(path.join(__dirname, 'test', value), require(path.join(__dirname, 'patterns', value)));
			
		});
		break;
}

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

function createFilesAndFolders (cwd, structure) {
	
	if (!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });
	if (!structure) return;
	
	for (const name in structure) {
		let content = structure[name];
		const pathname = path.join(cwd, name);
		if (typeof content === 'string') fs.symlink(pathname, content);
		else if (Array.isArray(content)) {
			content = typeof content[0] === 'number' ? Buffer.from(content) : content.join('\n');
			fs.writeFileSync(pathname, content);
		}else createFilesAndFolders(pathname, content);
	}
	
}

function removeFilesAndFolders (cwd) {
	
	if (fs.existsSync(cwd)) {
		fs.readdirSync(cwd).forEach((name) => {
			
			const pathname = path.join(cwd, name);
			
			if (fs.lstatSync(pathname).isDirectory()) removeFilesAndFolders(pathname);
			else fs.unlinkSync(pathname);
			
		});
		fs.rmdirSync(cwd);
	}
}