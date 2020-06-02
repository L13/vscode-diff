//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { copyFile, lstatSync, mkdirsSync } from './@l13/nodes/fse';

import { CopyFilesJob, Diff, File } from '../types';

import { DiffMessage } from './DiffMessage';
import { DiffOutput } from './DiffOutput';

//	Variables __________________________________________________________________

const BUTTON_COPY_DONT_ASK_AGAIN = 'Copy, don\'t ask again';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCopy {
	
	private readonly output:DiffOutput;
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (private msg:DiffMessage) {
		
		this.output = DiffOutput.createOutput();
		
		this.msg.on('copy:left', (data) => this.showCopyFromToDialog(data, 'A', 'B'));
		this.msg.on('copy:right', (data) => this.showCopyFromToDialog(data, 'B', 'A'));
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private copy (file:File, dest:string, callback:any) :void {
		
		const stat = lstatSync(file.path);
		
		if (stat) {
			const statDest = lstatSync(dest);
			if (stat.isDirectory()) {
				if (!statDest) {
					try {
						mkdirsSync(dest);
						callback();
					} catch (error) {
						callback(error);
					}
				} else {
					if (statDest.isDirectory()) callback();
					else callback(new Error(`'${dest}' exists, but is not a folder!`));
				}
			} else if (stat.isFile()) {
				if (!statDest || statDest.isFile()) {
					copyFile(file.path, dest, (error:Error) => {
						
						if (error) callback(error);
						else callback();
						
					});
				} else callback(new Error(`'${dest}' exists, but is not a file!`));
			} else if (stat.isSymbolicLink()) {
				if (!statDest || statDest.isSymbolicLink()) {
					if (statDest) fs.unlinkSync(dest);
					fs.symlink(fs.readlinkSync(file.path), dest, (error:Error) => {
						
						if (error) callback(error);
						else callback();
						
					});
				} else callback(new Error(`'${dest}' exists, but is not a symbolic link!`));
			}
		} else callback(new Error(`'${dest}' doesn't exist!`));
		
	}
	
	private showCopyFromToDialog (data:any, from:'A'|'B', to:'A'|'B') :void {
		
		const confirmCopy = vscode.workspace.getConfiguration('l13Diff').get('confirmCopy', true);
		const length = data.diffResult.diffs.length;
		
		if (!length) return;
		
		if (confirmCopy) {
			const text = `Copy ${length > 1 ? length + ' files' : `"${data.diffResult.diffs[0].id}"`} to "${data.diffResult['path' + to]}"?`;
			vscode.window.showInformationMessage(text, { modal: true }, 'Copy', BUTTON_COPY_DONT_ASK_AGAIN).then((value) => {
				
				if (value) {
					if (value === BUTTON_COPY_DONT_ASK_AGAIN) vscode.workspace.getConfiguration('l13Diff').update('confirmCopy', false, true);
					this.copyFromTo(data, from, to);
				} else this.msg.send('cancel');
				
			});
		} else this.copyFromTo(data, from, to);;
		
	}
	
	private copyFromTo (data:any, from:'A'|'B', to:'A'|'B') :void {
		
		const folderTo = data.diffResult['path' + to];
		const diffs:Diff[] = data.diffResult.diffs;
		let length:number = diffs.length;
		const job:CopyFilesJob = {
			error: null,
			tasks: length,
			done: () => {
				
				if (!job.tasks) this.msg.send(from === 'A' ? 'copy:left' : 'copy:right', data);
				
			},
		};
		
		diffs.forEach((diff:Diff) => {
			
			if (diff.status === 'unchanged') return --job.tasks;
			
			const fileFrom:File = (<any>diff)['file' + from];
			const stat = lstatSync(fileFrom.path);
			
			if (stat) {
				const dest = path.join(folderTo, fileFrom.relative);
				this.copy(fileFrom, dest, (error:null|Error) => {
					
					--job.tasks;
					
					if (error) {
						job.error = error;
						vscode.window.showErrorMessage(error.message);
					} else {
						this.output.log(`Copied ${diff.type} "${fileFrom.path}" to "${folderTo}".`);
						diff.status = 'unchanged';
						if (!(<File>(<any>diff)['file' + to])) {
							(<File>(<any>diff)['file' + to]) = {
								folder: folderTo,
								relative: fileFrom.relative,
								stat: lstatSync(dest),
								
								path: dest,
								name: fileFrom.name,
								basename: fileFrom.basename,
								dirname: fileFrom.dirname,
								extname: fileFrom.extname,
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

