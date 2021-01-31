//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/arrays';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffStatusbar {
	
	private static statusBarItem:vscode.StatusBarItem|undefined;
	
	public static currentStatus:DiffStatusbar|undefined;
	
	private static status:DiffStatusbar[] = [];
	
	private currentText = '';
	
	public constructor (context:vscode.ExtensionContext) {
		
		if (!DiffStatusbar.statusBarItem) {
			DiffStatusbar.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
			DiffStatusbar.statusBarItem.command = 'l13Diff.action.output.show';
			DiffStatusbar.statusBarItem.tooltip = 'Diff Folders Output';
			DiffStatusbar.statusBarItem.show();
			context.subscriptions.push(DiffStatusbar.statusBarItem);
		}
		
		DiffStatusbar.currentStatus = this;
		DiffStatusbar.status.push(this);
		
		this.update();
		
	}
	
	public activate () {
		
		if (DiffStatusbar.currentStatus !== this) {
			DiffStatusbar.currentStatus = this;
			DiffStatusbar.statusBarItem.text = this.currentText;
		}
		
	}
	
	public update (text:string = '') :void {
		
		this.currentText = '$(file-submodule) ' + (text || 'Diff Folders');
		
		if (DiffStatusbar.currentStatus === this) DiffStatusbar.statusBarItem.text = this.currentText;
		
	}
	
	public dispose () :void {
		
		remove(DiffStatusbar.status, this);
		
		if (!DiffStatusbar.status.length && DiffStatusbar.statusBarItem) {
			DiffStatusbar.statusBarItem.dispose();
			DiffStatusbar.statusBarItem = undefined;
		}
		
	}
	
}

//	Functions __________________________________________________________________

