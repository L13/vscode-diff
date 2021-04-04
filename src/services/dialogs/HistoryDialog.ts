//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { Comparison } from '../../types';

import * as dialogs from '../common/dialogs';
import * as files from '../common/files';
import * as terminal from '../common/terminal';

import { HistoryState } from '../states/HistoryState';
import { MenuState } from '../states/MenuState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryDialog {
	
	private static current:HistoryDialog = null;
	
	public static create (historyState:HistoryState, menuState:MenuState) {
		
		return HistoryDialog.current || (HistoryDialog.current = new HistoryDialog(historyState, menuState));
		
	}
	
	private constructor (private readonly historyState:HistoryState, private readonly menuState:MenuState) {}
	
	public async reveal (paths:string[]) {
		
		const items = this.createQucikPickItems(paths);
		const selectedItem = await vscode.window.showQuickPick(items, {
			placeHolder: 'Please select workspace',
		});
		
		if (selectedItem) files.reveal(selectedItem.path);
		
	}
	
	public async openInTerminal (paths:string[]) {
		
		const items = this.createQucikPickItems(paths);
		const selectedItem = await vscode.window.showQuickPick(items, {
			placeHolder: 'Please select workspace',
		});
		
		if (selectedItem) terminal.open(selectedItem.path);
		
	}
	
	private createQucikPickItems (paths:string[]) {
		
		return paths.map((fsPath) => {
			
			return {
				label: path.basename(fsPath),
				description: fsPath,
				path: fsPath,
			};
			
		});
		
	}
	
	public async remove (comparison:Comparison) {
		
		const text = `Delete comparison '${`${comparison.label}${comparison.desc ? ` (${comparison.desc})` : ''}`}'?`;
		
		if (await dialogs.confirm(text, 'Delete')) {
			this.historyState.remove(comparison);
		}
		
	}
	
	public async clear () {
		
		if (await dialogs.confirm('Delete the complete history?', 'Delete')) {
			this.menuState.clear();
			this.historyState.clear();
		}
		
	}
	
}

//	Functions __________________________________________________________________

