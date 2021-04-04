//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { Favorite } from '../@types/favorites';

import * as dialogs from '../common/dialogs';
import * as files from '../common/files';
import { parsePredefinedVariable } from '../common/paths';
import * as terminal from '../common/terminal';

import { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoritesDialog {
	
	private static current:FavoritesDialog = null;
	
	public static create (favoriteState:FavoritesState) {
		
		return FavoritesDialog.current || (FavoritesDialog.current = new FavoritesDialog(favoriteState));
		
	}
	
	private constructor (private readonly favoriteState:FavoritesState) {}
	
	public async add (fileA:string, fileB:string) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a name for the diff',
			value: `${fileA} ↔ ${fileB}`,
		});
		
		if (!label) return;
		
		if (this.favoriteState.getByName(label)) {
			if (!await dialogs.confirm(`Overwrite favorite "${label}"?`, 'Ok')) return;
		}
		
		this.favoriteState.add(label, fileA, fileB);
		
	}
	
	public async reveal (paths:string[]) {
		
		const items = this.createQuickPickItems(paths);
		
		if (!items.length) return;
		
		if (items.length > 1) {
			const selectedItem = await vscode.window.showQuickPick(items, {
				placeHolder: 'Please select a workspace',
			});
			
			if (selectedItem) files.reveal(selectedItem.path);
		} else files.reveal(items[0].path);
		
	}
	
	public async openInTerminal (paths:string[]) {
		
		const items = this.createQuickPickItems(paths);
		
		if (!items.length) return;
		
		if (items.length > 1) {
			const selectedItem = await vscode.window.showQuickPick(items, {
				placeHolder: 'Please select a workspace',
			});
			
			if (selectedItem) terminal.open(selectedItem.path);
		} else terminal.open(items[0].path);
		
	}
	
	private createQuickPickItems (paths:string[]) {
		
		return paths
			.map((fsPath) => {
			
				return fsPath = parsePredefinedVariable(fsPath, true);
			
			})
			.filter((fsPath) => {
				
				return fs.existsSync(fsPath);
				
			})
			.map((fsPath) => {
				
				return {
					label: path.basename(fsPath),
					description: fsPath,
					path: fsPath,
				};
				
			});
		
	}
	
	public async rename (favorite:Favorite) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a new name for the diff',
			value: favorite.label,
		});
		
		if (!label || favorite.label === label) return;
		
		if (this.favoriteState.getByName(label)) {
			vscode.window.showErrorMessage(`Favorite diff with the name "${label}" exists!`);
			return;
		}
		
		this.favoriteState.rename(favorite, label);
		
	}
	
	public async remove (favorite:Favorite) {
		
		if (await dialogs.confirm(`Delete favorite "${favorite.label}"?`, 'Delete')) {
			this.favoriteState.remove(favorite);
		}
		
	}
	
	public async clear () {
		
		if (await dialogs.confirm('Delete all favorites and groups?', 'Delete')) {
			this.favoriteState.clear();
		}
		
	}
	
}

//	Functions __________________________________________________________________

