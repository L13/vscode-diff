//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export async function open () {
	
	const uris = await vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: true,
		canSelectMany: true,
	});
	
	return uris || null;
	
}
	
export async function confirm (text:string, ...buttons:string[]) {
	
	return await vscode.window.showInformationMessage(text, { modal: true }, ...buttons);
	
}

//	Functions __________________________________________________________________

