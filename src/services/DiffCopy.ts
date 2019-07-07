//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { copyFile, mkdirsSync } from './@l13/fse';

import { CopyFilesJob, Diff, File } from '../types';
import { DiffResult } from './DiffResult';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCopy {
	
	private readonly panel:vscode.WebviewPanel;
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (panel:vscode.WebviewPanel) {
		
		this.panel = panel;
		
		this.panel.webview.onDidReceiveMessage((message:{ command:string, diffResult:DiffResult }) => {
			
			switch (message.command) {
				case 'copy:left':
					this.copyFromTo(message, 'A', 'B');
					break;
				case 'copy:right':
					this.copyFromTo(message, 'B', 'A');
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
	
	private copy (file:File, dest:string, callback:any) :void {
		
		const stat = fs.lstatSync(file.path);
		
		if (stat.isDirectory()) {
			if (!fs.existsSync(dest)) {
				try {
					mkdirsSync(dest);
					callback();
				} catch (error) {
					callback(error);
				}
			} else {
				if (fs.statSync(dest).isDirectory()) callback();
				else callback(new Error(`'${dest}' exists, but is not a folder!`));
			}
		} else if (stat.isFile()) {
			if (!fs.existsSync(dest) || fs.statSync(dest).isFile()) {
				copyFile(file.path, dest, (error:Error) => {
					
					if (error) callback(error);
					else callback();
					
				});
			} else callback(new Error(`'${dest}' exists, but is not a file!`));
		}
		
	}
	
	private copyFromTo (message:any, from:'A'|'B', to:'A'|'B') :void {
		
		const folderTo = message.diffResult['path' + to];
		const diffs:Diff[] = message.diffResult.diffs;
		let length:number = diffs.length;
		const job:CopyFilesJob = {
			error: null,
			tasks: length,
			done: () => {
				
				if (!job.error) vscode.window.showInformationMessage(`Copied ${length} file${length === 1 ? '' : 's'} to '${folderTo}'`);
				
				if (!job.tasks) this.panel.webview.postMessage(message);
				
			},
		};
		
		diffs.forEach((diff:Diff) => {
			
			if (diff.status === 'unchanged') return --job.tasks;
			
			const fileFrom:File = (<any>diff)['file' + from];
			
			if (fileFrom && fs.existsSync(fileFrom.path)) {
				const dest = path.join(folderTo, fileFrom.relative);
				this.copy(fileFrom, dest, (error:null|Error) => {
					
					--job.tasks;
					
					if (error) {
						job.error = error;
						vscode.window.showErrorMessage(error.message);
					} else {
						diff.status = 'unchanged';
						if (!(<any>diff)['file' + to]) {
							(<any>diff)['file' + to] = {
								folder: folderTo,
								path: dest,
								relative: fileFrom.relative,
								type: fileFrom.type,
							};
						}
					}
					
					if (!job.tasks) job.done();
					
				});
			} else {
				--job.tasks;
				--length;
				if (!job.tasks) job.done();
			}
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

