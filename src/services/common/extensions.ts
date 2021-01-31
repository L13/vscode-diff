//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { TextFiles } from '../../types';

const { push } = Array.prototype;

//	Variables __________________________________________________________________

const findRegExpChars = /([\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,])/g;

export const textfiles:TextFiles = {
	extensions: [],
	filenames: [],
	glob: null,
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function buildWhitelistForTextFiles () {
	
	const config = vscode.workspace.getConfiguration();
	
	textfiles.extensions = ['.txt'];
	textfiles.filenames = [];
	
	vscode.extensions.all.forEach((extension) => {
		
		const packageJSON = extension.packageJSON;
		
		if (packageJSON.contributes && packageJSON.contributes.languages) {
			packageJSON.contributes.languages.forEach((language:any) => {
				
				if (language.extensions) push.apply(textfiles.extensions, language.extensions);
				if (language.filenames) push.apply(textfiles.filenames, language.filenames);
				
			});
		}
		
	});
	
	if (config.has('files.associations')) {
		textfiles.glob = createFindGlob(Object.keys(config.get<object>('files.associations', {})));
	} else textfiles.glob = null;
	
	textfiles.extensions.sort();
	textfiles.filenames.sort();
	
}

//	Functions __________________________________________________________________

function createFindGlob (ignore:string[]) {
	
	return new RegExp(`^(${ignore.map((value) => escapeForRegExp(value)).join('|')})$`);
	
}

function escapeForRegExp (text:string) {
	
	return ('' + text).replace(findRegExpChars, (match) => {
		
		if (match === '*') return '.+';
		if (match === '?') return '?';
		
		return '\\' + match;
		
	});
	
}