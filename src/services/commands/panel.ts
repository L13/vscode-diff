//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { DiffPanelSettings } from '../../types';

import * as commands from '../common/commands';
import * as settings from '../common/settings';

import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________

let updateFiles: string[] = [];
let timeoutId: NodeJS.Timeout = null;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	commands.register(context, {
		
		'l13Diff.action.panel.open': () => DiffPanel.create(context),
		
		'l13Diff.action.panel.openAndCompare': (left: vscode.Uri, right: vscode.Uri, newPanel: boolean, openToSide: boolean) => {
			
			if (newPanel) DiffPanel.create(context, [left, right], true, openToSide);
			else DiffPanel.createOrShow(context, [left, right], true);
			
		},
		
	});
	
	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(DiffPanel.viewType, {
			
			// eslint-disable-next-line @typescript-eslint/require-await
			async deserializeWebviewPanel (webviewPanel: vscode.WebviewPanel) {
				
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
	
	context.subscriptions.push(vscode.workspace.onDidDeleteFiles(({ files }) => {
		
		if (files.length && DiffPanel.currentPanel) {
			const fsPaths = files.map((uri) => uri.fsPath);
			DiffPanel.sendAll('remove:files', { files: fsPaths });
		}
		
	}));
	
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
		
		if (event.affectsConfiguration('l13Diff.enablePreview')) {
			DiffPanel.sendAll<DiffPanelSettings>('change:settings', {
				enablePreview: !!settings.get('enablePreview'),
			});
		}
		
	}));
	
}

//	Functions __________________________________________________________________

function sendUpdateFiles () {
	
	DiffPanel.sendAll('update:files', { files: updateFiles });
	updateFiles = [];
	timeoutId = null;
	
}