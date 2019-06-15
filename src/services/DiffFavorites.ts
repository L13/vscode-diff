//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//	Variables __________________________________________________________________

export type Favorite = { fileA:string, fileB:string, label:string };

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffFavorites implements vscode.TreeDataProvider<NoFavoriteTreeItem|FavoriteTreeItem> {

// tslint:disable-next-line: max-line-length
	private _onDidChangeTreeData:vscode.EventEmitter<NoFavoriteTreeItem|FavoriteTreeItem|undefined> = new vscode.EventEmitter<NoFavoriteTreeItem|FavoriteTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<NoFavoriteTreeItem|FavoriteTreeItem|undefined> = this._onDidChangeTreeData.event;
	
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

	public getTreeItem (element:NoFavoriteTreeItem|FavoriteTreeItem) :vscode.TreeItem {
		
		return element;
		
	}

	public getChildren (element?:NoFavoriteTreeItem|FavoriteTreeItem) :Thenable<NoFavoriteTreeItem[]|FavoriteTreeItem[]> {
		
		if (!this.favorites.length) return Promise.resolve([new NoFavoriteTreeItem()]);
		
		return Promise.resolve(this.favorites.map((favorite) => new FavoriteTreeItem(favorite)));

	}
	
	public static removeFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const favorites:Favorite[] = context.globalState.get('favorites') || [];
		
		for (let i = 0; i < favorites.length; i++) {
			if (favorites[i].label === favorite.label) {
				favorites.splice(i, 1);
				context.globalState.update('favorites', favorites);
				DiffFavorites.createProvider(context).refresh();
				vscode.window.showInformationMessage(`L13 Diff - Removed favorite`);
				return;
			}
		}
		
		vscode.window.showErrorMessage(`L13 Diff - Favorite does not exist`);
		
	}
	
	public static clearFavorites (context:vscode.ExtensionContext) {
		
		context.globalState.update('favorites', []);
		
		DiffFavorites.createProvider(context).refresh();
		
		vscode.window.showInformationMessage(`L13 Diff - Cleared favorites`);
		
	}
	
}

// tslint:disable-next-line: max-classes-per-file
export class FavoriteTreeItem extends vscode.TreeItem {
	
	public command = {
		arguments: [this],
		command: 'l13Diff.openFavorite',
		title: 'Open Favorite',
	};
	
	// public iconPath = {
	// 	light: path.join(__filename, '..', 'images', 'favorite-light.svg'),
	// 	dark: path.join(__filename, '..', 'images', 'favorite-dark.svg'),
	// };
	
	public contextValue = 'favorite';
	
	public constructor (public readonly favorite:Favorite) {
		
		super(favorite.label);
		
	}
	
	public get tooltip () :string {
		
		return `${this.favorite.fileA} ↔ ${this.favorite.fileB}`;
		
	}
	
}

// tslint:disable-next-line: max-classes-per-file
class NoFavoriteTreeItem extends vscode.TreeItem {
	
	public contextValue = 'nofavorite';
	
	public constructor () {
		
		super('No favorites are available.');
		
	}
	
}

//	Functions __________________________________________________________________

