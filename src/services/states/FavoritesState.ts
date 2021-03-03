//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/arrays';

import { Favorite } from '../@types/favorites';

import * as dialogs from '../common/dialogs';
import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoritesState {
	
	private static currentFavoritesState:FavoritesState = null;
	
	public static createFavoritesState (context:vscode.ExtensionContext) {
		
		return FavoritesState.currentFavoritesState || (FavoritesState.currentFavoritesState = new FavoritesState(context));
		
	}
	
	public constructor (private readonly context:vscode.ExtensionContext) {}
	
	private _onDidUpdateFavorite:vscode.EventEmitter<Favorite> = new vscode.EventEmitter<Favorite>();
	public readonly onDidUpdateFavorite:vscode.Event<Favorite> = this._onDidUpdateFavorite.event;
	
	private _onDidDeleteFavorite:vscode.EventEmitter<Favorite> = new vscode.EventEmitter<Favorite>();
	public readonly onDidDeleteFavorite:vscode.Event<Favorite> = this._onDidDeleteFavorite.event;
	
	private _onDidChangeFavorites:vscode.EventEmitter<Favorite[]> = new vscode.EventEmitter<Favorite[]>();
	public readonly onDidChangeFavorites:vscode.Event<Favorite[]> = this._onDidChangeFavorites.event;
	
	public getFavorites () {
		
		return states.getFavorites(this.context);
		
	}
	
	public async addFavorite (fileA:string, fileB:string) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a name for the diff.',
			value: `${fileA} ↔ ${fileB}`,
		});
		
		if (!label) return;
		
		const favorites = states.getFavorites(this.context);
		let replacedFavorite = false;
		
		for (const favorite of favorites) {
			if (favorite.label === label) {
				if (!await dialogs.confirm(`Overwrite favorite "${favorite.label}"?`, 'Ok')) return;
				favorite.fileA = fileA;
				favorite.fileB = fileB;
				replacedFavorite = true;
			}
		}
		
		if (!replacedFavorite) favorites.push({ label, fileA, fileB });
		
		favorites.sort(({ label:a }, { label:b }) => sortCaseInsensitive(a, b));
		
		states.updateFavorites(this.context, favorites);
		this._onDidChangeFavorites.fire(favorites);
		
	}
	
	public async renameFavorite (favorite:Favorite) {
		
		const value = await vscode.window.showInputBox({
			placeHolder: 'Please enter a new name for the diff.',
			value: favorite.label,
		});
		
		if (favorite.label === value || value === undefined) return;
		
		if (!value) {
			vscode.window.showErrorMessage(`Favorite with no name is not valid!`);
			return;
		}
		
		const favorites = states.getFavorites(this.context);
		
		for (const fav of favorites) {
			if (fav.label === favorite.label) {
				if (!favorites.some(({ label }) => label === value)) {
					fav.label = value;
					favorites.sort(({ label:a}, { label:b }) => sortCaseInsensitive(a, b));
					states.updateFavorites(this.context, favorites);
					this._onDidUpdateFavorite.fire(favorite);
				} else vscode.window.showErrorMessage(`Favorite "${value}" exists!`);
				break;
			}
		}
		
	}
	
	public async removeFavorite (favorite:Favorite) {
		
		if (await dialogs.confirm(`Delete favorite "${favorite.label}"?`, 'Delete')) {
			const favorites = states.getFavorites(this.context);
			
			for (let i = 0; i < favorites.length; i++) {
				if (favorites[i].label === favorite.label) {
					const fav = favorites.splice(i, 1)[0];
					states.updateFavorites(this.context, favorites);
					this._onDidDeleteFavorite.fire(fav);
					break;
				}
			}
		}
		
	}
	
	public async clearFavorites () {
		
		if (await dialogs.confirm(`Delete all favorites and groups?'`, 'Delete')) {
			states.updateFavorites(this.context, []);
			states.updateFavoriteGroups(this.context, []);
			this._onDidChangeFavorites.fire([]);
		}
		
	}
	
}

//	Functions __________________________________________________________________

