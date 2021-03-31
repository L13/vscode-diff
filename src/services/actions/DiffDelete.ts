//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DeleteDialog, Diff, DiffFile } from '../../types';

import * as dialogs from '../common/dialogs';
import * as settings from '../common/settings';

import { DiffResult } from '../output/DiffResult';

//	Variables __________________________________________________________________

const selectableTrashDialog:DeleteDialog = {
	text: 'Which files should be moved to the trash?',
	textSingle: 'Which file should be moved to the trash?',
	buttonAll: 'Move All to Trash',
	buttonLeft: 'Move Left to Trash',
	buttonRight: 'Move Right to Trash',
};

const selectableDeleteDialog:DeleteDialog = {
	text: 'Which files should be permanently deleted?',
	textSingle: 'Which file should be permanently deleted?',
	buttonAll: 'Delete All',
	buttonLeft: 'Delete Left',
	buttonRight: 'Delete Right',
};

const simpleTrashDialog:DeleteDialog = {
	text: 'Are you sure to delete all selected files?',
	textSingle: 'Are you sure to delete the selected file?',
	buttonAll: 'Move to Trash',
	buttonOk: 'Move, don\'t show again',
};

const simpleDeleteDialog:DeleteDialog = {
	text: 'Are you sure to delete all selected files permanently?',
	textSingle: 'Are you sure to delete the selected file permanently?',
	buttonAll: 'Delete',
	buttonOk: 'Delete, don\'t show again',
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffDelete {
	
	private _onDidDeleteFile:vscode.EventEmitter<DiffFile> = new vscode.EventEmitter<DiffFile>();
	public readonly onDidDeleteFile:vscode.Event<DiffFile> = this._onDidDeleteFile.event;
	
	private _onDidDeleteFiles:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidDeleteFiles:vscode.Event<DiffResult> = this._onDidDeleteFiles.event;
	
	private _onDidCancel:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidCancel:vscode.Event<undefined> = this._onDidCancel.event;
	
	public async showDeleteFileDialog (data:DiffResult, side:'left'|'right') {
		
		const diffs:Diff[] = data.diffs;
		
		if (!diffs.length) return;
		
		const useTrash:boolean = settings.enableTrash();
		const confirmDelete:boolean = settings.get('confirmDelete', true);
		const dialog:DeleteDialog = useTrash ? simpleTrashDialog : simpleDeleteDialog;
		
		if (confirmDelete) {
			const value = await dialogs.confirm(dialog.textSingle, dialog.buttonAll, dialog.buttonOk);
			if (value) {
				if (value === dialog.buttonOk) settings.update('confirmDelete', false);
				this.deleteFiles(data, side, useTrash);
			} else this._onDidCancel.fire(undefined);
		} else this.deleteFiles(data, side, useTrash);
		
	}
	
	public async showDeleteFilesDialog (data:DiffResult) {
		
		const diffs:Diff[] = data.diffs;
		
		if (!diffs.length) return;
		
		let sides = 0;
		let selectSide = false;
		
		for (const diff of diffs) {
			// eslint-disable-next-line no-bitwise
			if (diff.fileA) sides |= 1;
			// eslint-disable-next-line no-bitwise
			if (diff.fileB) sides |= 2;
			if (sides === 3) {
				selectSide = true;
				break;
			}
		}
		
		const useTrash:boolean = settings.enableTrash();
		const confirmDelete:boolean = settings.get('confirmDelete', true);
		
		if (confirmDelete || selectSide) {
			let dialog:DeleteDialog = null;
			const args = [];
			
			if (selectSide) {
				dialog = useTrash ? selectableTrashDialog : selectableDeleteDialog;
				if (process.platform === 'win32') args.push(dialog.buttonLeft, dialog.buttonRight); // Fixes confusing order of buttons
				else args.push(dialog.buttonRight, dialog.buttonLeft);
			} else {
				dialog = useTrash ? simpleTrashDialog : simpleDeleteDialog;
				args.push(dialog.buttonOk);
			}
			
			const text = diffs.length > 2 ? dialog.text : dialog.textSingle;
			const value = await dialogs.confirm(text, dialog.buttonAll, ...args);
				
			if (value) {
				if (value === dialog.buttonOk) settings.update('confirmDelete', false, true);
				this.deleteFiles(data, value === dialog.buttonLeft ? 'left' : value === dialog.buttonRight ? 'right' : 'all', useTrash);
			} else this._onDidCancel.fire(undefined);
		} else this.deleteFiles(data, 'all', useTrash);
		
	}
	
	private async deleteFile (diffs:Diff[], pathname:string, useTrash:boolean) {
		
		try {
			await vscode.workspace.fs.delete(vscode.Uri.file(pathname), {
				recursive: true,
				useTrash,
			});
		} catch (error) {
			return vscode.window.showErrorMessage(error.message);
		}
		
		let file:DiffFile = null;
		
		for (const diff of diffs) {
			if (diff.fileA?.path === pathname) file = diff.fileA;
			if (diff.fileB?.path === pathname) file = diff.fileB;
			
			if (file) {
				this._onDidDeleteFile.fire(file);
				file = null;
			}
			
			if (diff.fileA?.path.startsWith(pathname)) diff.fileA = null;
			if (diff.fileB?.path.startsWith(pathname)) diff.fileB = null;
		}
		
	}
	
	private async deleteFiles (data:DiffResult, side:'all'|'left'|'right', useTrash:boolean) {
		
		const diffs:Diff[] = data.diffs;
		const folders:string[] = [];
		const files:string[] = [];
		
		for (const diff of diffs) {
			const fileA = diff.fileA;
			if (fileA && (side === 'all' || side === 'left')) {
				separateFilesAndFolders(fileA, folders, files);
			}
			const fileB = diff.fileB;
			if (fileB && (side === 'all' || side === 'right')) {
				separateFilesAndFolders(fileB, folders, files);
			}
		}
		
		removeSubfiles(folders.slice(), folders);
		removeSubfiles(folders, files);
		
		const promises = [];
		
		for (const file of [...folders, ...files]) {
			promises.push(this.deleteFile(diffs, file, useTrash));
		}
		
		await Promise.all(promises);
		
		this._onDidDeleteFiles.fire(data);
		
	}
	
}

//	Functions __________________________________________________________________

function separateFilesAndFolders (file:DiffFile, folders:string[], files:string[]) {
	
	if (file.type === 'folder') folders.push(file.path);
	else files.push(file.path);
	
}

function removeSubfiles (folders:string[], files:string[]) {
	
	for (const folder of folders) {
		let i = 0;
		let file;
		while ((file = files[i++])) {
			if (file !== folder && file.startsWith(folder)) files.splice(--i , 1);
		}
	}
	
}