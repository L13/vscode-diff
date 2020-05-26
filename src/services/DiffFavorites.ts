//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { Favorite } from '../types';
import { sortCaseInsensitive } from './common';

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
	
	public static addFavorite (context:vscode.ExtensionContext, fileA:string, fileB:string) {
		
		vscode.window.showInputBox({ value: `${fileA} ↔ ${fileB}` }).then((label) => {
					
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
				vscode.window.showInformationMessage(`Overwrite favorite "${favorite.label}"?`, { modal: true }, 'Ok').then((val) => {
						
					if (val) {
						favorites[index] = favorite;
						saveFavorite(context, favorites);
					}
					
				});
			}
			
		});
		
	}
	
	public static renameFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		vscode.window.showInputBox({ value: favorite.label }).then((value) => {
					
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
			
		});
		
	}
	
	public static removeFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		vscode.window.showInformationMessage(`Delete favorite "${favorite.label}"?`, { modal: true }, 'Delete').then((value) => {
			
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
			
		});
		
	}
	
	public static clearFavorites (context:vscode.ExtensionContext) {
		
		vscode.window.showInformationMessage(`Delete all favorites?'`, { modal: true }, 'Delete').then((value) => {
			
			if (value) {
				context.globalState.update(FAVORITES, []);
				DiffFavorites.createProvider(context).refresh();
			}
			
		});
		
	}
	
}

// tslint:disable-next-line: max-classes-per-file
class FavoriteTreeItem extends vscode.TreeItem {
	
	public command = {
		arguments: [this],
		command: 'l13Diff.openFavorite',
		title: 'Open Favorite',
	};
	
	public iconPath = {
		light: path.join(__filename, '..', '..', 'images', 'favorite-item-light.svg'),
		dark: path.join(__filename, '..', '..', 'images', 'favorite-item-dark.svg'),
	};
	
	public contextValue = 'favorite';
	
	public constructor (public readonly favorite:Favorite) {
		
		super(favorite.label);
		
	}
	
	public get tooltip () :string {
		
		return `${this.favorite.fileA} ↔ ${this.favorite.fileB}`;
		
	}
	
}

//	Functions __________________________________________________________________

function saveFavorite (context:vscode.ExtensionContext, favorites:Favorite[]) {
	
	favorites.sort(({ label:a }, { label:b }) => sortCaseInsensitive(a, b));
	context.globalState.update(FAVORITES, favorites);
	DiffFavorites.currentProvider.refresh();
	
}