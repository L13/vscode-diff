//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { copyFile, lstatSync, mkdirsSync } from '../@l13/nodes/fse';

import { CopyFilesJob, Diff, File } from '../../types';

import { DiffDialog } from '../common/DiffDialog';
import { DiffSettings } from '../common/DiffSettings';

//	Variables __________________________________________________________________

const BUTTON_COPY_DONT_ASK_AGAIN = 'Copy, don\'t ask again';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCopy {
	
	private _onDidCopyFile:vscode.EventEmitter<{ from:File, to:File }> = new vscode.EventEmitter<{ from:File, to:File }>();
	public readonly onDidCopyFile:vscode.Event<{ from:File, to:File }> = this._onDidCopyFile.event;
	
	private _onDidCopyFiles:vscode.EventEmitter<{ data:any, from:'A'|'B', to:'A'|'B' }> = new vscode.EventEmitter<{ data:any, from:'A'|'B', to:'A'|'B' }>();
	public readonly onDidCopyFiles:vscode.Event<{ data:any, from:'A'|'B', to:'A'|'B' }> = this._onDidCopyFiles.event;
	
	private _onInitMultiCopy:vscode.EventEmitter<{ ids:string[], pathA:string, pathB:string, from:'left'|'right' }> = new vscode.EventEmitter<{ ids:string[], pathA:string, pathB:string, from:'left'|'right' }>();
	public readonly onInitMultiCopy:vscode.Event<{ ids:string[], pathA:string, pathB:string, from:'left'|'right' }> = this._onInitMultiCopy.event;
	
	private _onDidCancel:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidCancel:vscode.Event<undefined> = this._onDidCancel.event;
	
	private async copy (file:File, dest:string) :Promise<any> {
		
		const stat = lstatSync(file.path);
		
		if (stat) {
			const statDest = lstatSync(dest);
			if (stat.isDirectory()) {
				if (!statDest) {
					try {
						mkdirsSync(dest);
						return Promise.resolve();
					} catch (error) {
						return Promise.reject(error);
					}
				} else {
					if (statDest.isDirectory()) return Promise.resolve();
					return Promise.reject(new Error(`'${dest}' exists, but is not a folder!`));
				}
			} else if (stat.isFile()) {
				if (!statDest || statDest.isFile()) {
					return new Promise((resolve, reject) => {
						
						copyFile(file.path, dest, (error:Error) => {
						
							if (error) reject(error);
							else resolve();
							
						});
						
					});
				}
				return Promise.reject(new Error(`'${dest}' exists, but is not a file!`));
			} else if (stat.isSymbolicLink()) {
				if (!statDest || statDest.isSymbolicLink()) {
					if (statDest) fs.unlinkSync(dest);
					return new Promise((resolve, reject) => {
						
						fs.symlink(fs.readlinkSync(file.path), dest, (error:Error) => {
						
							if (error) reject(error);
							else resolve();
							
						});
						
					});
				}
				return Promise.reject(new Error(`'${dest}' exists, but is not a symbolic link!`));
			}
		}
		
		return Promise.reject(new Error(`'${dest}' doesn't exist!`));
		
	}
	
	public async showCopyFromToDialog (data:any, from:'A'|'B', to:'A'|'B') {
		
		const confirmCopy = DiffSettings.get('confirmCopy', true);
		const length = data.diffResult.diffs.length;
		
		if (!length) return;
		
		if (confirmCopy && !data.silent) {
			const text = `Copy ${length > 1 ? length + ' files' : `"${data.diffResult.diffs[0].id}"`} to "${data.diffResult['path' + to]}"?`;
			const value = await DiffDialog.confirm(text, 'Copy', BUTTON_COPY_DONT_ASK_AGAIN);
				
			if (value) {
				if (value === BUTTON_COPY_DONT_ASK_AGAIN) DiffSettings.update('confirmCopy', false);
				this.copyFromTo(data, from, to);
			} else this._onDidCancel.fire();
		} else this.copyFromTo(data, from, to);;
		
	}
	
	public async showMultiCopyFromToDialog (data:any, from:'left'|'right') {
		
		const ids:string[] = data.ids;
		const length = ids.length;
		
		if (!length) return;
		
		const folderFrom = from === 'left' ? data.pathA : data.pathB;
		const text = `Copy ${length > 1 ? length + ' files' : `"${ids[0]}"`} from "${folderFrom}" in all diff panels?`;
		const value = await DiffDialog.confirm(text, 'Copy');
		
		if (value) {
			this._onInitMultiCopy.fire({
				ids: data.ids,
				pathA: data.pathA,
				pathB: data.pathB,
				from,
			});
		} else this._onDidCancel.fire();
		
	}
	
	private copyFromTo (data:any, from:'A'|'B', to:'A'|'B') :void {
		
		const folderTo = data.diffResult['path' + to];
		const diffs:Diff[] = data.diffResult.diffs;
		let length:number = diffs.length;
		const job:CopyFilesJob = {
			error: null,
			tasks: length,
			done: () => {
				
				if (!job.tasks) this._onDidCopyFiles.fire({ data, from ,to});
				
			},
		};
		
		diffs.forEach(async (diff:Diff) => {
			
			if (diff.status === 'unchanged') {
				--job.tasks;
				if (!job.tasks) job.done();
				return;
			}
			
			const fileFrom:File = (<any>diff)['file' + from];
			const stat = lstatSync(fileFrom.path);
			
			if (stat) {
				const dest = path.join(folderTo, fileFrom.relative);
				
				try {
					await this.copy(fileFrom, dest);
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
					
					this._onDidCopyFile.fire({
						from: (<File>(<any>diff)['file' + from]),
						to: (<File>(<any>diff)['file' + to]),
					});
					
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
				
				--job.tasks;
				
				if (!job.tasks) job.done();
					
			} else {
				--job.tasks;
				--length;
				if (!job.tasks) job.done();
			}
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

