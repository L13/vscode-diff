//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	let folderUri:vscode.Uri = null;
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.selectForCompare', (uri:vscode.Uri) => {
		
		if (!folderUri) vscode.commands.executeCommand('setContext', 'l13DiffSelectedFolder', true);
		
		folderUri = uri;
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.compareWithSelected', (uri:vscode.Uri) => {
		
		vscode.commands.executeCommand('l13Diff.openAndCompare', folderUri, uri);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.compareSelected', (uri:vscode.Uri, uris:vscode.Uri[]) => {
		
		vscode.commands.executeCommand('l13Diff.openAndCompare', uris[0], uris[1]);
		
	}));
	
}

//	Functions __________________________________________________________________

