//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffDialog {
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (private msg:DiffMessage) {
		
		msg.on('open:dialog', () => this.open());
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private async open () {
		
		const uris = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: true,
			canSelectMany: false,
		});
		
		const folder = uris ? uris[0].fsPath : null;
		
		this.msg.send('open:dialog', { folder });
		
	}
	
}

//	Functions __________________________________________________________________

