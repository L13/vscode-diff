//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { formatAmount } from '../../@l13/formats';
import { pluralFiles } from '../../@l13/units/files';
import { copyFile, copySymbolicLink, createDirectory, lstat } from '../@l13/fse';

import { CopyFileEvent, CopyFilesEvent, CopyFilesJob, Diff, DiffCopyMessage, DiffFile, DiffMultiCopyMessage, MultiCopyEvent } from '../../types';

import * as dialogs from '../common/dialogs';
import * as settings from '../common/settings';

//	Variables __________________________________________________________________



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
	
	private async copy (file:DiffFile, dest:string) :Promise<undefined|Error>  {
		
		const stat = await lstat(file.fsPath);
		
		if (!stat) return Promise.reject(new Error(`'${file.fsPath}' doesn't exist!`));
		
		const statDest = await lstat(dest);
		
		if (stat.isDirectory()) {
			if (!statDest || statDest.isDirectory()) {
				if (!statDest) createDirectory(dest);
				return Promise.resolve(undefined);
			}
			return Promise.reject(new Error(`'${dest}' exists, but is not a folder!`));
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
	
	public async showCopyFromToDialog (data:DiffCopyMessage, from:'A'|'B', to:'A'|'B') {
		
		const confirmCopy = settings.get('confirmCopy', true);
		const length = data.diffs.length;
		
		if (!length) return;
		
		if (confirmCopy && !data.multi) {
			const buttonCopyDontShowAgain = 'Copy, don\'t show again';
			const text = `Copy ${formatAmount(length, pluralFiles)} to "${(<any>data)['path' + to]}"?`;
			const value = await dialogs.confirm(text, 'Copy', buttonCopyDontShowAgain);
				
			if (value) {
				if (value === buttonCopyDontShowAgain) settings.update('confirmCopy', false);
				this.copyFromTo(data, from, to);
			} else this._onDidCancel.fire(undefined);
		} else this.copyFromTo(data, from, to);
		
	}
	
	public async showMultiCopyFromToDialog (data:DiffMultiCopyMessage, from:'left'|'right') {
		
		const ids:string[] = data.ids;
		const length = ids.length;
		
		if (!length) return;
		
		const folderFrom = from === 'left' ? data.pathA : data.pathB;
		const text = `Copy ${formatAmount(length, pluralFiles)} from "${folderFrom}" across all diff panels?`;
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
			
			if (fileFrom) {
				const fsPath = fileFrom.fsPath;
				
				if (fs.existsSync(fsPath)) {
					let fileTo = to === 'A' ? diff.fileA : diff.fileB;
					const relative = fileTo?.relative || fileFrom.relative;
					const dest = path.join(folderTo, relative);
					let copy = null;
					
					if (!fileTo) copy = await existsCaseInsensitiveFileAndCopy(fsPath, folderTo, relative, dest);
					
					if (copy === null || copy) {
						try {
							await this.copy(fileFrom, dest);
							
							if (copy === null) {
								if (diff.status !== 'ignored') diff.status = 'unchanged';
								if (!fileTo) {
									fileTo = copyDiffFile(fileFrom, folderTo, dest);
									if (to === 'A') diff.fileA = fileTo;
									else diff.fileB = fileTo;
								}
								fileTo.stat = await lstat(dest);
							}
							
							this._onDidCopyFile.fire({ from: fileFrom, to: fileTo });
						} catch (error) {
							vscode.window.showErrorMessage(error.message);
						}
					}
				}
			}
			
			job.tasks--;
			
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
	};
	
}

function getRealRelative (root:string, relative:string) {
	
	const names = relative.split(path.sep);
	let cwd = root;
	
	return path.join(...names.map((name) => {
		
		const cwdNames = fs.readdirSync(cwd);
		
		name = name.toUpperCase();
		
		for (const cwdName of cwdNames) {
			if (cwdName.toUpperCase() === name) {
				cwd = path.join(cwd, cwdName);
				return cwdName;
			}
		}
		
	}));
	
}

async function existsCaseInsensitiveFileAndCopy (fsPath:string, folderTo:string, relative:string, dest:string) :Promise<boolean> {
	
	if (!settings.hasCaseSensitiveFileSystem && fs.existsSync(dest)) {
		if (!settings.get('confirmCaseInsensitiveCopy', true)) return true;
		const realRelative = getRealRelative(folderTo, relative);
		if (relative !== realRelative) {
			const buttonCopyDontShowAgain = 'Copy, don\'t show again';
			const text = `Overwrite content of file "${path.join(folderTo, realRelative)}" with file "${fsPath}"?`;
			const copy = await dialogs.confirm(text, 'Copy', buttonCopyDontShowAgain);
			if (copy === buttonCopyDontShowAgain) settings.update('confirmCaseInsensitiveCopy', false);
			return !!copy;
		}
	}
	
	return null;
	
}