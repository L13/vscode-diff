//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Diff, File } from '../types';
import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffDelete {
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (private msg:DiffMessage) {
		
		this.msg.on('delete:files', (data) => this.showDeleteFilesDialog(data));
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private showDeleteFilesDialog (data:any) :void {
		
		const diffs:Diff[] = data.diffResult.diffs;
		
		if (!diffs.length) return;
		
		const useTrash:boolean = vscode.workspace.getConfiguration('files').get('enableTrash', true);
		let sides:number = 0;
		
		for (const diff of diffs) {
			// tslint:disable-next-line: no-bitwise
			if (diff.fileA) sides |= 1;
			// tslint:disable-next-line: no-bitwise
			if (diff.fileB) sides |= 2;
			if (sides > 2) break;
		}
		
		if (sides > 2) {
			const text = `Which files should be ${useTrash ? 'moved to the trash' : 'permanently deleted'}?`;
			const all = useTrash ? 'Move All to Trash' : 'Delete All';
			const left = useTrash ? 'Move Left to Trash' : 'Delete Left';
			const right = useTrash ? 'Move Right to Trash' : 'Delete Right';
			vscode.window.showInformationMessage(text, { modal: true }, all, right, left).then((value) => {
				
				if (value) this.deleteFiles(data, value === left ? 'left' : value === right ? 'right' : 'all', useTrash);
				
			});
		} else {
			const text = `${useTrash ? 'Move' : 'Delete'} all selected files${useTrash ? ' to the trash' : ''}?`;
			vscode.window.showInformationMessage(text, { modal: true }, useTrash ? 'Move to Trash' : 'Delete').then((value) => {
				
				if (value) this.deleteFiles(data, 'all', useTrash);
				
			});
		}
		
	}
	
	private deleteFiles (data:any, side:'all'|'left'|'right', useTrash:boolean) :void {
		
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
		
		for (const file of folders.concat(files)) promises.push(deleteFile(diffs, file, useTrash));
		
		Promise.all(promises).then(() => {
			
			this.msg.send('delete:files', data);
			
		});
		
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
			if (file !== folder && file.indexOf(folder) === 0) files.splice(--i , 1);
		}
	}
	
}

function deleteFile (diffs:Diff[], pathname:string, useTrash:boolean) {
	
	return vscode.workspace.fs.delete(vscode.Uri.file(pathname), {
		recursive: true,
		useTrash,
	}).then(() => {
		
		for (const diff of diffs) {
			const fileA = diff.fileA;
			const fileB = diff.fileB;
			if (fileA && fileA.path.indexOf(pathname) === 0) diff.fileA = null;
			if (fileB && fileB.path.indexOf(pathname) === 0) diff.fileB = null;
		}
		
	}, (error) => vscode.window.showErrorMessage(error.message));
	
}