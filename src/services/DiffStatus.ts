//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffStatus {
	
	private readonly statusBarItem:vscode.StatusBarItem;
	
	public constructor (context:vscode.ExtensionContext) {
		
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
		this.update();
		this.statusBarItem.show();
		
		context.subscriptions.push(this.statusBarItem);
		
	}
	
	public update (text:string = '') :void {
		
		this.statusBarItem.text = 'L13 Diff' + (text ? ` - ${text}` : '');
		
	}
	
	public dispose () :void {
		
		this.statusBarItem.dispose();
		
	}
	
}

//	Functions __________________________________________________________________

