//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/natvies/arrays';
import { Favorite } from '../../types';

import { DiffDialog } from '../common/DiffDialog';
import { FavoriteTreeItem } from './trees/FavoriteTreeItem';

//	Variables __________________________________________________________________

const FAVORITES = 'favorites';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffFavorites implements vscode.TreeDataProvider<FavoriteTreeItem> {
	
	private _onDidChangeTreeData:vscode.EventEmitter<FavoriteTreeItem|undefined> = new vscode.EventEmitter<FavoriteTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<FavoriteTreeItem|undefined> = this._onDidChangeTreeData.event;
	
	public favorites:Favorite[] = [];
	
	public static currentProvider:DiffFavorites|undefined;
	
	public static createProvider (context:vscode.ExtensionContext) {
		
		return DiffFavorites.currentProvider || (DiffFavorites.currentProvider = new DiffFavorites(context));
		
	}
	
	private constructor (private context:vscode.ExtensionContext) {
		
		this.favorites = this.context.globalState.get(FAVORITES) || [];
		
	}
	
	public refresh () :void {
		
		this.favorites = this.context.globalState.get(FAVORITES) || [];
		
		this._onDidChangeTreeData.fire();
		
	}
	
	public getTreeItem (element:FavoriteTreeItem) :vscode.TreeItem {
		
		return element;
		
	}
	
	public getChildren (element?:FavoriteTreeItem) :Thenable<FavoriteTreeItem[]> {
		
		const list:FavoriteTreeItem[] = [];
		
		if (!this.favorites.length) return Promise.resolve(list);
		
		return Promise.resolve(list.concat(this.favorites.map((favorite) => new FavoriteTreeItem(favorite))));
		
	}
	
	public static async addFavorite (context:vscode.ExtensionContext, fileA:string, fileB:string) {
		
		const label = await vscode.window.showInputBox({ value: `${fileA} ↔ ${fileB}` });
		
		if (!label) return;
		
		const favorites:Favorite[] = context.globalState.get(FAVORITES) || [];
		const favorite:Favorite = { label, fileA, fileB };
		let index = -1;
		
		for (let i = 0; i < favorites.length; i++) {
			if (favorites[i].label === label) {
				index = i;
				break;
			}
		}
		
		if (index === -1) {
			favorites.push(favorite);
			saveFavorite(context, favorites);
		} else {
			const value = await DiffDialog.confirm(`Overwrite favorite "${favorite.label}"?`, 'Ok');
			if (value) {
				favorites[index] = favorite;
				saveFavorite(context, favorites);
			}
		}
		
	}
	
	public static async renameFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const value = await vscode.window.showInputBox({ value: favorite.label });
		
		if (favorite.label === value || value === undefined) return;
		
		if (!value) {
			vscode.window.showErrorMessage(`Favorite with no name is not valid!`);
			return;
		}
		
		const favorites:Favorite[] = context.globalState.get(FAVORITES) || [];
		
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < favorites.length; i++) {
			if (favorites[i].label === favorite.label) {
				if (!favorites.some(({ label }) => label === value)) {
					favorites[i].label = value;
					favorites.sort(({ label:a}, { label:b }) => sortCaseInsensitive(a, b));
					context.globalState.update(FAVORITES, favorites);
					DiffFavorites.createProvider(context).refresh();
				} else vscode.window.showErrorMessage(`Favorite "${value}" exists!`);
				break;
			}
		}
		
	}
	
	public static async removeFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const value = await DiffDialog.confirm(`Delete favorite "${favorite.label}"?`, 'Delete');
		
		if (value) {
			const favorites:Favorite[] = context.globalState.get(FAVORITES) || [];
			
			for (let i = 0; i < favorites.length; i++) {
				if (favorites[i].label === favorite.label) {
					favorites.splice(i, 1);
					context.globalState.update(FAVORITES, favorites);
					DiffFavorites.createProvider(context).refresh();
					return;
				}
			}
			
			vscode.window.showErrorMessage(`Favorite does not exist`);
		}
		
	}
	
	public static async clearFavorites (context:vscode.ExtensionContext) {
		
		const value = await DiffDialog.confirm(`Delete all favorites?'`, 'Delete');
		
		if (value) {
			context.globalState.update(FAVORITES, []);
			DiffFavorites.createProvider(context).refresh();
		}
		
	}
	
}

//	Functions __________________________________________________________________

function saveFavorite (context:vscode.ExtensionContext, favorites:Favorite[]) {
	
	favorites.sort(({ label:a }, { label:b }) => sortCaseInsensitive(a, b));
	context.globalState.update(FAVORITES, favorites);
	DiffFavorites.currentProvider.refresh();
	
}