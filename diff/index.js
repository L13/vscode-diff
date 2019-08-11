//	Imports ____________________________________________________________________

const fs = require('fs');
const path = require('path');

//	Variables __________________________________________________________________

const findArg = /^\-/;
const trimOption = /^\-\-/;

const args = process.argv.slice(2);

let action = '';
let values = [];

let root = path.join(__dirname, 'test');

const manual = `
USAGE: node ${path.basename(__filename)} [OPTIONS]

OPTIONS

    --clean           Remove all files and folders from the root folder.

    --random          Create a random test file and folder structure.

    --shared          Changed cwd to /Users/Shared folder.

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
		case '--clean': removeFilesAndFolders(path.join(root)); args.shift(); break;
		case '--create': [action, values] = parseOptions(args); break;
		case '--random': action = 'random'; args.shift(); break;
		case '--shared': root = '/Users/Shared/L13 Diff'; args.shift(); break;
		case '--create-all': action = 'all'; args.shift(); break;
		default: console.error(`Option '${args[0]}' does not exist\n${manual}`); process.exit(); break params;
	}
}

switch (action) {
	case 'create':
		let value;
		while ((value = values.shift())) {
			createFilesAndFolders(path.join(root, value), require(path.join(__dirname, 'patterns', value)));
		}
		break;
	case 'random':
		removeFilesAndFolders(path.join(root, 'random'));
		createRandomFilesAndFolders(3);
		break;
	case 'all':
		const files = fs.readdirSync(path.join(__dirname, 'patterns'));
		files.forEach((value) => {
			
			value = path.basename(value, '.json');
			
			createFilesAndFolders(path.join(root, value), require(path.join(__dirname, 'patterns', value)));
			
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

function random (min, max) {
	
	min = Math.ceil(min);
	max = Math.floor(max);
	
	return Math.floor(Math.random() * (max - min +1)) + min;
	
}

function createRandomStructure (depth) {
	
	if (!depth) return null;
	
	const structure = {};
	
	for (let i = 0, max = random(13, 26); i < max; i++) {
		const name = Math.random() > 0.5 ? 'file' : 'folder';
		const char = String.fromCharCode(97 + i);
		if (name === 'folder') structure[`${name}-${char}`] = Math.random() > 0.5 ? null : createRandomStructure(depth - 1);
		else structure[`${name}-${char}.txt`] = [ Math.random() > 0.5 ? char : String.fromCharCode(random(1, 127))];
	}
	
	return structure;
	
}

function createRandomFilesAndFolders (depth) {
	
	createFilesAndFolders(path.join(root, 'random'), {
		'folder-a': createRandomStructure(depth),
		'folder-b': createRandomStructure(depth),
	});
	
}