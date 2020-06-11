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
			DiffStatus.statusBarItem.tooltip = 'L13 Diff Output';
			DiffStatus.statusBarItem.show();
			context.subscriptions.push(DiffStatus.statusBarItem);
		}
		
		this.update();
		
		DiffStatus.currentStatus = this;
		DiffStatus.status.push(this);
		
	}
	
	public activate () {
		
		DiffStatus.currentStatus = this;
		DiffStatus.statusBarItem.text = this.currentText;
		
	}
	
	public update (text:string = '') :void {
		
		this.currentText = '$(file-submodule) ' + (text || 'L13 Diff');
		
		if (DiffStatus.currentStatus === this) DiffStatus.statusBarItem.text = this.currentText;
		
	}
	
	public dispose () :void {
		
		remove(DiffStatus.status, this);
		DiffStatus.currentStatus = DiffStatus.status[DiffStatus.status.length - 1];
		
		if (!DiffStatus.status.length) DiffStatus.statusBarItem.dispose();
		
	}
	
}

//	Functions __________________________________________________________________

