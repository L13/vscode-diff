"use strict";

//	Imports ____________________________________________________________________

const through = require('through2');
const path = require('path');

//	Variables __________________________________________________________________

const pluginName = 'gulp-file2json';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

module.exports = function (file) {
	
	if (!file) {
		throw new Error(`${pluginName}: Missing file options`);
	}
	
	const options = typeof file === 'string' ? { path: file } : file;
	
	if (typeof options.path !== 'string') {
		throw new Error(`${pluginName}: Missing path in file options`);
	}
	
	const template = options.template || "export default __CONTENT__;";
	const root = options.root || '';
	const indent = options.indent || '';
	const json = {};
	
	let latestFile;
	let latestMod;
	
	function bufferContents (file, encoding, done) {
		
		if (file.isNull()) {
			done();
			return;
		}
		if (file.isStream()) {
			this.emit('error', new Error(`${pluginName}: Streaming not supported`));
			done();
			return;
		}
		if (!latestMod || file.stat && file.stat.mtime > latestMod) {
			latestFile = file;
			latestMod = file.stat && file.stat.mtime;
		}
		
		const relative = path.sep === path.win32.sep ? path.posix.join.apply(path.posix, file.relative.split(path.sep)) : file.relative;
		
		json[path.posix.join(root, relative)] = stripBOM(file.contents.toString());
		
		done();
		
	}
	
	function endStream (done) {
		
		if (!latestFile) {
			done();
			return;
		}
		
		const joinedFile = latestFile.clone({ contents: false });
		
		joinedFile.path = path.join(latestFile.base, options.path);
		joinedFile.contents = Buffer.from(parseTemplate(template, { __CONTENT__: JSON.stringify(sortPaths(json), null, indent) }));
		
		this.push(joinedFile);
		
		done();
			
	}
	
	return through.obj(bufferContents, endStream);
	
};

//	Functions __________________________________________________________________

function parseTemplate (content, map) {
	
	return content.replace(/__[A-Z0-9]+__/g, function (match) {
		
		return map.hasOwnProperty(match) ? map[match] :  '';
		
	});
	
}

function stripBOM (str) {
	
	return 0xFEFF === str.charCodeAt(0) ? str.substring(1) : str;
	
}

function sortPaths (json) {
	
	const keys = Object.keys(json).sort();
	const map = {};
	
	keys.forEach((key) => map[key] = json[key]);
	
	return map;
	
}