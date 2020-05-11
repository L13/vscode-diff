//	Imports ____________________________________________________________________

import { WorkspaceFolder } from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function workspacePaths (workspaceFolders:readonly WorkspaceFolder[]|undefined) {
	
	return (workspaceFolders || []).map((item:WorkspaceFolder) => item.uri.fsPath);
	
}

export function sortCaseInsensitive (a:string, b:string) {
					
	a = a.toLowerCase();
	b = b.toLowerCase();
	
	return a < b ? -1 : a > b ? 1 : 0;
	
}

//	Functions __________________________________________________________________

