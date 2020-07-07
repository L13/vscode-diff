//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { register } from '../common/commands';

import { DiffPanel } from '../services/panel/DiffPanel';

//	Variables __________________________________________________________________

let updateFiles:string[] = [];
let timeoutId:NodeJS.Timeout = null;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	register(context, {
		
		'l13Diff.show': () => DiffPanel.create(context),
		
		'l13Diff.openAndCompare': (left, right, openToSide) => {
			
			if (openToSide) DiffPanel.create(context, [left, right], true);
			else DiffPanel.createOrShow(context, [left, right], true);
			
		},
		
		'l13Diff.open': async (...uris:any[]) => {
			
			if (!uris.length) {
				const dialogUris = await vscode.window.showOpenDialog({
					canSelectFiles: true,
					canSelectFolders: true,
					canSelectMany: true,
				});
				
				if (dialogUris) DiffPanel.create(context, dialogUris.slice(0, 2));
			} else DiffPanel.create(context, uris[1].slice(0, 2));
			
		},
	});
	
	if (vscode.window.registerWebviewPanelSerializer) {
		
		vscode.window.registerWebviewPanelSerializer(DiffPanel.viewType, {
			
			async deserializeWebviewPanel (webviewPanel:vscode.WebviewPanel) {
				
				DiffPanel.revive(webviewPanel, context);
				
			},
			
		});
	}
	
	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(({ fileName }) => {
		
		if (fileName && DiffPanel.currentPanel) {
			if (timeoutId !== null) clearTimeout(timeoutId);
			updateFiles.push(fileName);
			timeoutId = setTimeout(sendUpdateFiles, 200);
		}
		
	}));
	
}

//	Functions __________________________________________________________________

function sendUpdateFiles () {
	
	DiffPanel.sendAll('update:files', { files: updateFiles });
	updateFiles = [];
	timeoutId = null;
	
}