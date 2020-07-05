//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/natvies/arrays';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffStatus {
	
	private static statusBarItem:vscode.StatusBarItem|undefined;
	
	public static currentStatus:DiffStatus|undefined;
	
	private static status:DiffStatus[] = [];
	
	private currentText = '';
	
	public constructor (context:vscode.ExtensionContext) {
		
		if (!DiffStatus.statusBarItem) {
			DiffStatus.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
			DiffStatus.statusBarItem.command = 'l13Diff.showOutput';
			DiffStatus.statusBarItem.tooltip = 'Diff Folders Output';
			DiffStatus.statusBarItem.show();
			context.subscriptions.push(DiffStatus.statusBarItem);
		}
		
		DiffStatus.currentStatus = this;
		DiffStatus.status.push(this);
		
		this.update();
		
	}
	
	public activate () {
		
		if (DiffStatus.currentStatus !== this) {
			DiffStatus.currentStatus = this;
			DiffStatus.statusBarItem.text = this.currentText;
		}
		
	}
	
	public update (text:string = '') :void {
		
		this.currentText = '$(file-submodule) ' + (text || 'Diff Folders');
		
		if (DiffStatus.currentStatus === this) DiffStatus.statusBarItem.text = this.currentText;
		
	}
	
	public dispose () :void {
		
		remove(DiffStatus.status, this);
		
		if (!DiffStatus.status.length && DiffStatus.statusBarItem) {
			DiffStatus.statusBarItem.dispose();
			DiffStatus.statusBarItem = undefined;
		}
		
	}
	
}

//	Functions __________________________________________________________________

