//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function workspacePaths (workspaceFolders:vscode.WorkspaceFolder[]|undefined) {
	
	return (workspaceFolders || []).map((item:vscode.WorkspaceFolder) => item.uri.fsPath);
	
}

//	Functions __________________________________________________________________

