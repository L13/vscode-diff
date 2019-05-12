//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffDialog {
	
	private readonly panel:vscode.WebviewPanel;
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (panel:vscode.WebviewPanel) {
		
		this.panel = panel;
		
		this.panel.webview.onDidReceiveMessage((message) => {
			
			switch (message.command) {
				case 'open:dialog':
					this.open(message);
					break;
			}
			
		}, null, this.disposables);
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private open (message:any) :void {
		
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: true,
			canSelectMany: false,
		}).then((uris) => {
			
			if (uris) this.panel.webview.postMessage({ command: message.command, folder: uris[0].fsPath });
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

