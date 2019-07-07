//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//	Variables __________________________________________________________________

export type Favorite = { fileA:string, fileB:string, label:string };

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffFavorites implements vscode.TreeDataProvider<OpenL13DiffTreeItem|FavoriteTreeItem> {

// tslint:disable-next-line: max-line-length
	private _onDidChangeTreeData:vscode.EventEmitter<OpenL13DiffTreeItem|FavoriteTreeItem|undefined> = new vscode.EventEmitter<OpenL13DiffTreeItem|FavoriteTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<OpenL13DiffTreeItem|FavoriteTreeItem|undefined> = this._onDidChangeTreeData.event;
	
	public favorites:Favorite[] = [];
	
	public static currentProvider:DiffFavorites|undefined;
	
	public static createProvider (context:vscode.ExtensionContext) {
		
		return DiffFavorites.currentProvider || (DiffFavorites.currentProvider = new DiffFavorites(context));
		
	}

	private constructor (private context:vscode.ExtensionContext) {
		
		this.favorites = this.context.globalState.get('favorites') || [];
		
	}

	public refresh () :void {
		
		this.favorites = this.context.globalState.get('favorites') || [];
		
		this._onDidChangeTreeData.fire();
		
	}

	public getTreeItem (element:OpenL13DiffTreeItem|FavoriteTreeItem) :vscode.TreeItem {
		
		return element;
		
	}

	public getChildren (element?:OpenL13DiffTreeItem|FavoriteTreeItem) :Thenable<OpenL13DiffTreeItem[]|FavoriteTreeItem[]> {
		
		const list:Array<OpenL13DiffTreeItem|FavoriteTreeItem> = [new OpenL13DiffTreeItem()];
		
		if (!this.favorites.length) return Promise.resolve(list);
		
		return Promise.resolve(list.concat(this.favorites.map((favorite) => new FavoriteTreeItem(favorite))));

	}
	
	public static renameFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		vscode.window.showInputBox({ value: favorite.label }).then((value) => {
					
			if (favorite.label === value || value === undefined) return;
			
			if (!value) {
				vscode.window.showErrorMessage(`Favorite with no name is not valid!`);
				return;
			}
			
			const favorites:Favorite[] = context.globalState.get('favorites') || [];
			
			// tslint:disable-next-line: prefer-for-of
			for (let i = 0; i < favorites.length; i++) {
				if (favorites[i].label === favorite.label) {
					if (!favorites.some(({ label }) => label === value)) {
						favorites[i].label = value;
						favorites.sort(({ label:a }, { label:b }) => a > b ? 1 : a < b ? -1 : 0);
						context.globalState.update('favorites', favorites);
						DiffFavorites.createProvider(context).refresh();
						vscode.window.showInformationMessage(`Saved '${value}' in favorites!`);
					} else vscode.window.showErrorMessage(`Favorite '${value}' exists!`);
					break;
				}
			}
			
		});
		
	}
	
	public static removeFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const favorites:Favorite[] = context.globalState.get('favorites') || [];
		
		for (let i = 0; i < favorites.length; i++) {
			if (favorites[i].label === favorite.label) {
				favorites.splice(i, 1);
				context.globalState.update('favorites', favorites);
				DiffFavorites.createProvider(context).refresh();
				vscode.window.showInformationMessage(`Deleted favorite`);
				return;
			}
		}
		
		vscode.window.showErrorMessage(`Favorite does not exist`);
		
	}
	
	public static clearFavorites (context:vscode.ExtensionContext) {
		
		context.globalState.update('favorites', []);
		
		DiffFavorites.createProvider(context).refresh();
		
		vscode.window.showInformationMessage(`Deleted all favorites`);
		
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

// tslint:disable-next-line: max-classes-per-file
class OpenL13DiffTreeItem extends vscode.TreeItem {
	
	public command = {
		command: 'l13Diff.show',
		title: 'Open L13 Diff',
	};
	
	public iconPath = {
		light: path.join(__filename, '..', '..', 'images', 'favorite-l13-light.svg'),
		dark: path.join(__filename, '..', '..', 'images', 'favorite-l13-dark.svg'),
	};
	
	public contextValue = 'openL13Diff';
	
	public constructor () {
		
		super('Diff');
		
	}
	
	public get tooltip () :string {
		
		return 'Open L13 Diff';
		
	}
	
}

//	Functions __________________________________________________________________

