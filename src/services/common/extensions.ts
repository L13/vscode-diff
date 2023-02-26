//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { PackageLanguage } from '../../types';

//	Variables __________________________________________________________________

// eslint-disable-next-line no-useless-escape
const findRegExpChars = /([\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,])/g;
const findStartDot = /^\./;

let findExtensions: RegExp = null;
let filenames: string[] = [];
let findAssociations: RegExp = null;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function isTextFile (basename: string) {
	
	return findExtensions.test(basename)
	|| filenames.includes(basename)
	|| findAssociations && findAssociations.test(basename);
	
}
export function buildWhitelistForTextFiles () {
	
	const config = vscode.workspace.getConfiguration();
	const extensions = ['*.txt'];
	
	filenames = [];
	
	vscode.extensions.all.forEach((extension) => {
		
		const packageJSON = extension.packageJSON;
		
		(<PackageLanguage[]>packageJSON.contributes?.languages)?.forEach((language) => {
			
			language.extensions?.forEach((extname: string) => {
				
				extensions.push((findStartDot.test(extname) ? '*' : '') + extname);
				
			});
			
			if (language.filenames) filenames.push(...language.filenames);
			
		});
		
	});
	
	extensions.sort();
	findExtensions = createFindGlob(extensions);
	filenames.sort();
	
	if (config.has('files.associations')) {
		findAssociations = createFindGlob(Object.keys(config.get('files.associations', {})));
	} else findAssociations = null;
	
}

//	Functions __________________________________________________________________

function createFindGlob (ignore: string[]) {
	
	return new RegExp(`^(${ignore.map((value) => escapeForRegExp(value)).join('|')})$`, 'i');
	
}

function escapeForRegExp (text: string) {
	
	return `${text}`.replace(findRegExpChars, (match) => {
		
		if (match === '*') return '.*';
		if (match === '?') return '.';
		
		return `\\${match}`;
		
	});
	
}