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
		let total = 0;
		
		files:for (const diff of diffs) {
			
			if (diff.fileA && (side === 'All' || side === 'Left')) {
				try {
					const result = unlinkSync(diff.fileA.path);
					if (result) {
						diff.fileA = null;
						total += result;
					}
				} catch (error) {
					vscode.window.showErrorMessage(error.message);
					break files;
				}
			}
			
			if (diff.fileB && (side === 'All' || side === 'Right')) {
				try {
					const result = unlinkSync(diff.fileB.path);
					if (result) {
						diff.fileB = null;
						total += result;
					}
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

