//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { workspacePaths } from './common';
import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffMenu {
	
	private readonly context:vscode.ExtensionContext;
	
	private disposables:vscode.Disposable[] = [];
	
	public static clearHistory (context:vscode.ExtensionContext) :void {
		
		context.globalState.update('history', []);
		vscode.window.showInformationMessage(`Cleared history`);
		
	}
	
	public constructor (private msg:DiffMessage, context:vscode.ExtensionContext) {
		
		this.context = context;
		
		this.msg.on('update:menu', () => {
			
			this.msg.send('update:menu', {
				history: this.context.globalState.get('history') || [],
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
			});
			
		});
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
}

//	Functions __________________________________________________________________

