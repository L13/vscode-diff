//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________

// eslint-disable-next-line no-useless-escape
const findPlaceholder = /^\$\{workspaceFolder(?:\:((?:\\\}|[^\}])*))?\}/;
const findEscapedEndingBrace = /\\\}/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function workspacePaths (workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined) {
	
	return (workspaceFolders || []).map((item: vscode.WorkspaceFolder) => item.uri.fsPath);
	
}

export function parsePredefinedVariable (pathname: string, ignoreErrors = false) {
	
	return pathname.replace(findPlaceholder, function (match, name: string) {
		
		const workspaceFolders = vscode.workspace.workspaceFolders;
		
		if (!workspaceFolders) {
			if (!ignoreErrors) vscode.window.showErrorMessage('No workspace folder available!');
			return match;
		}
		
		if (!name) return workspaceFolders[0].uri.fsPath;
		
		name = name.replace(findEscapedEndingBrace, '}');
		
		for (const workspaceFolder of workspaceFolders) {
			if (workspaceFolder.name === name) return workspaceFolder.uri.fsPath;
		}
		
		if (!ignoreErrors) vscode.window.showErrorMessage(`No workspace folder with name "${name}" available!`);
		
		return match;
		
	});
	
}

//	Functions __________________________________________________________________

