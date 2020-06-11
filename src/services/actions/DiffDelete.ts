//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Dialog, Diff, File } from '../../types';

import { DiffDialog } from '../common/DiffDialog';
import { DiffSettings } from '../common/DiffSettings';

//	Variables __________________________________________________________________

const selectableTrashDialog:Dialog = {
	text: 'Which files should be moved to the trash?',
	textSingle: 'Which file should be moved to the trash?',
	buttonAll: 'Move All to Trash',
	buttonLeft: 'Move Left to Trash',
	buttonRight: 'Move Right to Trash',
};

const selectableDeleteDialog:Dialog = {
	text: 'Which files should be permanently deleted?',
	textSingle: 'Which file should be permanently deleted?',
	buttonAll: 'Delete All',
	buttonLeft: 'Delete Left',
	buttonRight: 'Delete Right',
};

const simpleTrashDialog:Dialog = {
	text: 'Are you sure to delete all selected files?',
	textSingle: 'Are you sure to delete selected file?',
	buttonAll: 'Move to Trash',
	buttonOk: 'Move, don\'t ask again',
};

const simpleDeleteDialog:Dialog = {
	text: 'Are you sure to delete all selected files?',
	textSingle: 'Are you sure to delete selected file?',
	buttonAll: 'Delete',
	buttonOk: 'Delete, don\'t ask again',
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffDelete {
	
	private _onDidDeleteFile:vscode.EventEmitter<File> = new vscode.EventEmitter<File>();
	public readonly onDidDeleteFile:vscode.Event<File> = this._onDidDeleteFile.event;
	
	private _onDidDeleteFiles:vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	public readonly onDidDeleteFiles:vscode.Event<any> = this._onDidDeleteFiles.event;
	
	private _onDidCancel:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidCancel:vscode.Event<undefined> = this._onDidCancel.event;
	
	public async showDeleteFileDialog (data:any, side:'left'|'right') {
		
		const diffs:Diff[] = data.diffResult.diffs;
		
		if (!diffs.length) return;
		
		const useTrash:boolean = DiffSettings.enableTrash();
		const confirmDelete:boolean = DiffSettings.get('confirmDelete', true);
		const dialog:Dialog = useTrash ? simpleTrashDialog : simpleDeleteDialog;
		
		if (confirmDelete) {
			const value = await DiffDialog.confirm(dialog.textSingle, dialog.buttonAll, dialog.buttonOk);
			if (value) {
				if (value === dialog.buttonOk) DiffSettings.update('confirmDelete', false);
				this.deleteFiles(data, side, useTrash);
			} else this._onDidCancel.fire();
		} else this.deleteFiles(data, side, useTrash);
		
	}
	
	public async showDeleteFilesDialog (data:any) {
		
		const diffs:Diff[] = data.diffResult.diffs;
		
		if (!diffs.length) return;
		
		let sides:number = 0;
		
		for (const diff of diffs) {
			// tslint:disable-next-line: no-bitwise
			if (diff.fileA) sides |= 1;
			// tslint:disable-next-line: no-bitwise
			if (diff.fileB) sides |= 2;
			if (sides > 2) break;
		}
		
		const useTrash:boolean = DiffSettings.enableTrash();
		const confirmDelete:boolean = DiffSettings.get('confirmDelete', true);
		
		if (confirmDelete || sides > 2) {
			let dialog:Dialog = null;
			const args = [];
			
			if (sides > 2) {
				dialog = useTrash ? selectableTrashDialog : selectableDeleteDialog;
				if (process.platform === 'win32') args.push(dialog.buttonLeft, dialog.buttonRight); // Fixes confusing order of buttons
				else args.push(dialog.buttonRight, dialog.buttonLeft);
			} else {
				dialog = useTrash ? simpleTrashDialog : simpleDeleteDialog;
				args.push(dialog.buttonOk);
			}
			
			const text = diffs.length > 2 ? dialog.text : dialog.textSingle;
			const value = await DiffDialog.confirm(text, dialog.buttonAll, ...args);
				
			if (value) {
				if (value === dialog.buttonOk) DiffSettings.update('confirmDelete', false, true);
				this.deleteFiles(data, value === dialog.buttonLeft ? 'left' : value === dialog.buttonRight ? 'right' : 'all', useTrash);
			} else this._onDidCancel.fire();
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
		
		let file = null;
		
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
	
	private async deleteFiles (data:any, side:'all'|'left'|'right', useTrash:boolean) {
		
		const diffs:Diff[] = data.diffResult.diffs;
		const folders:string[] = [];
		const files:string[] = [];
		
		for (const diff of diffs) {
			const fileA = diff.fileA;
			if (fileA && (side === 'all' || side === 'left')) separateFilesAndFolders(fileA, folders, files);
			const fileB = diff.fileB;
			if (fileB && (side === 'all' || side === 'right')) separateFilesAndFolders(fileB, folders, files);
		}
		
		removeSubfiles(folders.slice(), folders);
		removeSubfiles(folders, files);
		
		const promises = [];
		
		for (const file of folders.concat(files)) promises.push(this.deleteFile(diffs, file, useTrash));
		
		await Promise.all(promises);
		
		this._onDidDeleteFiles.fire(data);
		
	}
	
}

//	Functions __________________________________________________________________

function separateFilesAndFolders (file:File, folders:string[], files:string[]) {
	
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