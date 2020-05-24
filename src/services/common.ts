//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________

const findComments = /"(?:[^"\r\n\\]*(?:\.)*)*"|(\/\*(?:.|[\r\n])*?\*\/|\/\/[^\r\n]*)/g;

export let isMacOs = false;
export let isWindows = false;
export let isLinux = false;

//	Initialize _________________________________________________________________

if (process.platform === 'darwin') isMacOs = true;
else if (process.platform === 'win32') isWindows = true;
else isLinux = true;

//	Exports ____________________________________________________________________

export function workspacePaths (workspaceFolders:readonly vscode.WorkspaceFolder[]|undefined) {
	
	return (workspaceFolders || []).map((item:vscode.WorkspaceFolder) => item.uri.fsPath);
	
}

export function sortCaseInsensitive (a:string, b:string) {
					
	a = a.toLowerCase();
	b = b.toLowerCase();
	
	return a < b ? -1 : a > b ? 1 : 0;
	
}

export function removeCommentsFromJSON (text:string) :string {
	
	return text.replace(findComments, (match, comment) => {
		
		return comment ? '' : match;
		
	});
	
}

//	Functions __________________________________________________________________

