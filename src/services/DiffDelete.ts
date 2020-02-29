//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { unlinkSync } from './@l13/fse';

import { Diff } from '../types';
import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffDelete {
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (private msg:DiffMessage) {
		
		this.msg.on('delete:all', (data) => this.showDeleteAllFilesDialog(data));
		this.msg.on('delete:only', (data) => this.showDeleteOnlyFilesDialog(data));
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private showDeleteAllFilesDialog (data:any) :void {
		
		const length = data.diffResult.diffs.reduce((total:number, diff:Diff) => {
			
			if (diff.fileA) total++;
			if (diff.fileB) total++;
			
			return total;
			
		}, 0);
		
		if (!length) return;
		
		const text = `Delete ${length} file${length === 1 ? '' : 's'}?`;
		
		vscode.window.showInformationMessage(text, { modal: true }, 'Delete').then((value) => {
			
			if (value) this.deleteFiles(data, 'All');
			
		});
		
	}
	
	private showDeleteOnlyFilesDialog (data:any) :void {
		
		if (!data.diffResult.diffs.length) return;
		
		const text = 'Delete left or right selected files?';
		
		vscode.window.showInformationMessage(text, { modal: true }, 'Right', 'Left').then((value:undefined|string) => {
			
			if (value) this.deleteFiles(data, <'Left'|'Right'>value);
			
		});
		
	}
	
	private deleteFiles (data:any, side:'All'|'Left'|'Right') :void {
		
		const diffs:Diff[] = data.diffResult.diffs;
		let total = 0;
		
		files:for (const diff of diffs) {
			console.log(diff);
			if (diff.fileA && (side === 'All' || side === 'Left')) {
				try {
					unlinkSync(diff.fileA.path, () => total++);
					diff.fileA = null;
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
					break files;
				}
			}
			
			if (diff.fileB && (side === 'All' || side === 'Right')) {
				try {
					unlinkSync(diff.fileB.path, () => total++);
					diff.fileB = null;
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
					break files;
				}
			}
			
		}
		
		vscode.window.showInformationMessage(`Deleted ${total} file${total === 1 ? '' : 's'}`);
		
		this.msg.send('delete', data);
		
	}
	
}

//	Functions __________________________________________________________________

