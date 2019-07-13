//	Imports ____________________________________________________________________

import { DiffMessage } from './DiffMessage';

import * as vscode from 'vscode';

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
	
	private open () :void {
		
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: true,
			canSelectMany: false,
		}).then((uris) => {
			
			if (uris) this.msg.send('open:dialog', { folder: uris[0].fsPath });
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

