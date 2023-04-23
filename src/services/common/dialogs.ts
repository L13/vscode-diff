//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export async function openFile (options: { filters?: { [name: string]: string[] } } = {}) {
	
	const uris = await vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		...options,
	});
	
	return uris ? uris[0].fsPath : null;
	
}

export async function openFolder () {
	
	const uris = await vscode.window.showOpenDialog({
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
	});
	
	return uris ? uris[0].fsPath : null;
	
}
	
export async function confirm (text: string, ...buttons: string[]) {
	
	return await vscode.window.showInformationMessage(text, { modal: true }, ...buttons);
	
}

//	Functions __________________________________________________________________

