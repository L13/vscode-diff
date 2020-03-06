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
		
		if (!data.diffResult.diffs.length) return;
		
		const text = `Which files do you want to delete?`;
		
		vscode.window.showInformationMessage(text, { modal: true }, 'Delete All', 'Delete Right', 'Delete Left').then((value) => {
			
			if (value) this.deleteFiles(data, <'All'|'Left'|'Right'>(<string>value).replace('Delete ', ''));
			
		});
		
	}
	
	private deleteFiles (data:any, side:'All'|'Left'|'Right') :void {
		
		const diffs:Diff[] = data.diffResult.diffs;
		const folders:string[] = [];
		const files:string[] = [];
	
		for (const diff of diffs) {
			const fileA = diff.fileA;
			if (fileA && (side === 'All' || side === 'Left')) separateFilesAndFolders(fileA, folders, files);
			const fileB = diff.fileB;
			if (fileB && (side === 'All' || side === 'Right')) separateFilesAndFolders(fileB, folders, files);
		}
		
		removeSubfiles(folders.slice(), folders);
		removeSubfiles(folders, files);
		
		const useTrash:boolean = vscode.workspace.getConfiguration('files').get('enableTrash');
		const summary = { total: 0 };
		const promises = [];
		
		for (const file of folders.concat(files)) promises.push(deleteFile(diffs, file, useTrash, summary));
		
		Promise.all(promises).then(() => {
			
			const total = summary.total;
			
			vscode.window.showInformationMessage(`Deleted ${total} file${total === 1 ? '' : 's'}.`);
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

function deleteFile (diffs:Diff[], pathname:string, useTrash:boolean, summary:{ total:number }) {
	
	return vscode.workspace.fs.delete(vscode.Uri.file(pathname), {
		recursive: true,
		useTrash,
	}).then(() => {
		
		for (const diff of diffs) {
			const fileA = diff.fileA;
			if (fileA && fileA.path.indexOf(pathname) === 0) {
				diff.fileA = null;
				summary.total++;
			}
			const fileB = diff.fileB;
			if (fileB && fileB.path.indexOf(pathname) === 0) {
				diff.fileB = null;
				summary.total++;
			}
		}
		
	}, (error) => vscode.window.showErrorMessage(error.message));
	
}