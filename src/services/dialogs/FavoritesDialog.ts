//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Favorite } from '../@types/favorites';

import * as dialogs from '../common/dialogs';

import { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoritesDialog {
	
	private static current:FavoritesDialog = null;
	
	public static create (favoriteState:FavoritesState) {
		
		return FavoritesDialog.current || (FavoritesDialog.current = new FavoritesDialog(favoriteState));
		
	}
	
	public constructor (private readonly favoriteState:FavoritesState) {}
	
	public async add (fileA:string, fileB:string) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a name for the diff.',
			value: `${fileA} ↔ ${fileB}`,
		});
		
		if (!label) return;
		
		if (this.favoriteState.getByName(label)) {
			if (!await dialogs.confirm(`Overwrite favorite "${label}"?`, 'Ok')) return;
		}
		
		this.favoriteState.add(label, fileA, fileB);
		
	}
	
	public async rename (favorite:Favorite) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a new name for the diff.',
			value: favorite.label,
		});
		
		if (!label || favorite.label === label) return;
		
		this.favoriteState.rename(favorite, label);
		
	}
	
	public async remove (favorite:Favorite) {
		
		if (await dialogs.confirm(`Delete favorite "${favorite.label}"?`, 'Delete')) {
			this.favoriteState.remove(favorite);
		}
		
	}
	
	public async clear () {
		
		if (await dialogs.confirm(`Delete all favorites and groups?'`, 'Delete')) {
			this.favoriteState.clear();
		}
		
	}
	
}

//	Functions __________________________________________________________________

