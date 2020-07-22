//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { copyFile, copySymbolicLink, lstat } from '../@l13/fse';

import { CopyFileEvent, CopyFilesEvent, CopyFilesJob, Diff, DiffCopyMessage, DiffFile, DiffMultiCopyMessage, MultiCopyEvent } from '../../types';

import * as dialogs from '../../common/dialogs';
import * as settings from '../../common/settings';

//	Variables __________________________________________________________________

const BUTTON_COPY_DONT_SHOW_AGAIN = 'Copy, don\'t show again';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCopy {
	
	private _onDidCopyFile:vscode.EventEmitter<CopyFileEvent> = new vscode.EventEmitter<CopyFileEvent>();
	public readonly onDidCopyFile:vscode.Event<CopyFileEvent> = this._onDidCopyFile.event;
	
	private _onDidCopyFiles:vscode.EventEmitter<CopyFilesEvent> = new vscode.EventEmitter<CopyFilesEvent>();
	public readonly onDidCopyFiles:vscode.Event<CopyFilesEvent> = this._onDidCopyFiles.event;
	
	private _onInitMultiCopy:vscode.EventEmitter<MultiCopyEvent> = new vscode.EventEmitter<MultiCopyEvent>();
	public readonly onInitMultiCopy:vscode.Event<MultiCopyEvent> = this._onInitMultiCopy.event;
	
	private _onDidCancel:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidCancel:vscode.Event<undefined> = this._onDidCancel.event;
	
	private async copy (file:DiffFile, dest:string) :Promise<any> {
		
		const stat = await lstat(file.fsPath);
		
		if (stat) {
			const statDest = await lstat(dest);
			if (stat.isDirectory()) {
				if (!statDest) {
					try {
						fs.mkdirSync(dest, { recursive: true });
						return Promise.resolve();
					} catch (error) {
						return Promise.reject(error);
					}
				} else {
					if (statDest.isDirectory()) return Promise.resolve();
					return Promise.reject(new Error(`'${dest}' exists, but is not a folder!`));
				}
			} else if (stat.isFile()) {
				if (!statDest || statDest.isFile()) return await copyFile(file.fsPath, dest);
				return Promise.reject(new Error(`'${dest}' exists, but is not a file!`));
			} else if (stat.isSymbolicLink()) {
				if (!statDest || statDest.isSymbolicLink()) {
					if (statDest) fs.unlinkSync(dest); // Delete existing symlink otherwise an error occurs
					return await copySymbolicLink(file.fsPath, dest);
				}
				return Promise.reject(new Error(`'${dest}' exists, but is not a symbolic link!`));
			}
		}
		
		return Promise.reject(new Error(`'${dest}' doesn't exist!`));
		
	}
	
	public async showCopyFromToDialog (data:DiffCopyMessage, from:'A'|'B', to:'A'|'B') {
		
		const confirmCopy = settings.get('confirmCopy', true);
		const length = data.diffs.length;
		
		if (!length) return;
		
		if (confirmCopy && !data.multi) {
			const text = `Copy ${length > 1 ? length + ' files' : `"${data.diffs[0].id}"`} to "${(<any>data)['path' + to]}"?`;
			const value = await dialogs.confirm(text, 'Copy', BUTTON_COPY_DONT_SHOW_AGAIN);
				
			if (value) {
				if (value === BUTTON_COPY_DONT_SHOW_AGAIN) settings.update('confirmCopy', false);
				this.copyFromTo(data, from, to);
			} else this._onDidCancel.fire(undefined);
		} else this.copyFromTo(data, from, to);;
		
	}
	
	public async showMultiCopyFromToDialog (data:DiffMultiCopyMessage, from:'left'|'right') {
		
		const ids:string[] = data.ids;
		const length = ids.length;
		
		if (!length) return;
		
		const folderFrom = from === 'left' ? data.pathA : data.pathB;
		const text = `Copy ${length > 1 ? length + ' files' : `"${ids[0]}"`} from "${folderFrom}" across all diff panels?`;
		const value = await dialogs.confirm(text, 'Copy');
		
		if (value) this._onInitMultiCopy.fire({ data, from });
		else this._onDidCancel.fire(undefined);
		
	}
	
	private copyFromTo (data:DiffCopyMessage, from:'A'|'B', to:'A'|'B') :void {
		
		const folderTo = to === 'A' ? data.pathA : data.pathB;
		const diffs:Diff[] = data.diffs;
		const job:CopyFilesJob = {
			error: null,
			tasks: diffs.length,
			done: () => this._onDidCopyFiles.fire({ data, from ,to }),
		};
		
		diffs.forEach(async (diff:Diff) => {
			
			const fileFrom:DiffFile = from === 'A' ? diff.fileA : diff.fileB;
			const stat = await lstat(fileFrom.fsPath);
			
			if (stat) {
				const dest = path.join(folderTo, fileFrom.relative);
				
				try {
					await this.copy(fileFrom, dest);
					if (diff.status !== 'ignored') diff.status = 'unchanged';
					let fileTo = to === 'A' ? diff.fileA : diff.fileB;
				
					if (!fileTo) {
						fileTo = copyDiffFile(fileFrom, folderTo, dest);
						if (to === 'A') diff.fileA = fileTo;
						else diff.fileB = fileTo;
					}
					
					fileTo.stat = await lstat(dest);
					this._onDidCopyFile.fire({ from: fileFrom, to: fileTo });
					
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
				}
			}
			
			--job.tasks;
			if (!job.tasks) job.done();
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

function copyDiffFile (fileFrom:DiffFile, root:string, dest:string) :DiffFile {
	
	return {
		root,
		relative: fileFrom.relative,
		fsPath: dest,
		stat: null,
		
		path: dest + (fileFrom.type === 'folder' ? path.sep : ''),
		name: fileFrom.name,
		basename: fileFrom.basename,
		dirname: fileFrom.dirname,
		extname: fileFrom.extname,
		type: fileFrom.type,
		ignore: fileFrom.ignore,
	}
	
}