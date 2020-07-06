//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { createFindGlob } from '../services/@l13/nodes/fse';

import { TextFiles } from '../types';

const { push } = Array.prototype;

//	Variables __________________________________________________________________

export const textfiles:TextFiles = {
	extensions: [],
	filenames: [],
	glob: null,
};

//	Initialize _________________________________________________________________

buildWhitelistForTextFiles();

vscode.extensions.onDidChange(() => buildWhitelistForTextFiles());

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

function buildWhitelistForTextFiles () {
	
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