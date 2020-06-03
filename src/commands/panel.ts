//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffPanel } from '../services/DiffPanel';

//	Variables __________________________________________________________________

let updateFiles:string[] = [];
let timeoutId:NodeJS.Timeout = null;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.show', () => DiffPanel.createOrShow(context)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.open', (...uris:any[]) => {
		
		if (!uris.length) {
			vscode.window.showOpenDialog({
				canSelectFiles: true,
				canSelectFolders: true,
				canSelectMany: true,
			}).then((dialogUris) => {
				
				if (dialogUris) DiffPanel.createOrShow(context, dialogUris.slice(0, 2));
				
			});
		} else DiffPanel.createOrShow(context, uris[1].slice(0, 2));
		
	}));
	
	if (vscode.window.registerWebviewPanelSerializer) {
		
		vscode.window.registerWebviewPanelSerializer(DiffPanel.viewType, {
			
			async deserializeWebviewPanel (webviewPanel:vscode.WebviewPanel) {
				
				DiffPanel.revive(webviewPanel, context);
				
			},
			
		});
	}
	
	vscode.workspace.onDidSaveTextDocument(({ fileName }) => {
		
		if (fileName && DiffPanel.currentPanel) {
			if (timeoutId !== null) clearTimeout(timeoutId);
			updateFiles.push(fileName);
			timeoutId = setTimeout(sendUpdateFiles, 200);
		}
		
	});
	
}

//	Functions __________________________________________________________________

function sendUpdateFiles () {
	
	DiffPanel.send('update:files', { files: updateFiles });
	updateFiles = [];
	timeoutId = null;
	
}