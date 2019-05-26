//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as vscode from 'vscode';

import { Diff, File } from '../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOpen {
	
	private readonly panel:vscode.WebviewPanel;
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (panel:vscode.WebviewPanel) {
		
		this.panel = panel;
		
		this.panel.webview.onDidReceiveMessage((message) => {
			
			switch (message.command) {
				case 'open:diffToSide':
					this.open(message, true);
					break;
				case 'open:diff':
					this.open(message, vscode.workspace.getConfiguration('l13Diff').get('openToSide', false));
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
	
	private openFile (file:File, openToSide:boolean) :void {
		
		fs.lstat(file.path, (error, stat) => {
			
			if (error) return vscode.window.showErrorMessage(error.message);
			
			if (stat.isFile()) {
				const pathname = vscode.Uri.file(file.path);
				vscode.commands.executeCommand('vscode.open', pathname, {
					// preserveFocus: false,
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			}
			
		});
		
	}
	
	private openDiff (diff:Diff, openToSide:boolean) :void {
		
		const fileA:File = <File>diff.fileA;
		
		fs.lstat(fileA.path, (errorA, statA) => {
			
			if (errorA) return vscode.window.showErrorMessage(errorA.message);
			
			if (statA.isFile()) {
				const fileB:File = <File>diff.fileB;
				fs.lstat(fileB.path, (errorB, statB) => {
					
					if (errorB) return vscode.window.showErrorMessage(errorB.message);
					
					if (statB.isFile()) {
						const left = vscode.Uri.file(fileA.path);
						const right = vscode.Uri.file(fileB.path);
						vscode.commands.executeCommand('vscode.diff', left, right, `${fileA.relative} (${fileA.folder} ↔ ${fileB.folder})`, {
							// preserveFocus: false,
							preview: false,
							viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
						});
					} else vscode.window.showErrorMessage(`Files can't be compared! '${fileB.path}' is not a file!`);
					
				});
			} else vscode.window.showErrorMessage(`Files can't be compared! '${fileA.path}' is not a file!`);
			
		});
		
	}
	
	private open (message:any, openToSide:boolean) :void {
		
		const diff:Diff = message.diff;
		
		switch (diff.status) {
			case 'deleted':
				this.openFile(<File>diff.fileA, openToSide);
				break;
			case 'modified':
			case 'unchanged':
				this.openDiff(diff, openToSide);
				break;
			case 'untracked':
				this.openFile(<File>diff.fileB, openToSide);
				break;
		}
		
	}
	
}

//	Functions __________________________________________________________________

