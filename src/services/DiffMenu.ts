//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { workspacePaths } from './common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffMenu {
	
	private readonly panel:vscode.WebviewPanel;
	private readonly context:vscode.ExtensionContext;
	
	private disposables:vscode.Disposable[] = [];
	
	public static clearHistory (context:vscode.ExtensionContext) :void {
		
		context.globalState.update('history', []);
		vscode.window.showInformationMessage(`L13 Diff - Cleared history`);
		
	}
	
	public constructor (panel:vscode.WebviewPanel, context:vscode.ExtensionContext) {
		
		this.panel = panel;
		this.context = context;
		
		this.panel.webview.onDidReceiveMessage((message) => {
			
			if (message.command === 'update:menu') {
				this.panel.webview.postMessage({
					command: message.command,
					history: this.context.globalState.get('history') || [],
					workspaces: workspacePaths(vscode.workspace.workspaceFolders),
				});
			}
			
		}, null, this.disposables);
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
}

//	Functions __________________________________________________________________

