//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

//	Variables __________________________________________________________________

export type Favorite = { fileA:string, fileB:string, label:string };

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffFavoritesProvider implements vscode.TreeDataProvider<FavoriteTreeItem> {

	private _onDidChangeTreeData:vscode.EventEmitter<FavoriteTreeItem|undefined> = new vscode.EventEmitter<FavoriteTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<FavoriteTreeItem|undefined> = this._onDidChangeTreeData.event;
	
	public favorites:Favorite[] = [];

	public constructor (private context:vscode.ExtensionContext) {
		
		this.favorites = /*this.context.globalState.get('favorites') ||*/ [{
			fileA: '/Users/l13rary/vscode/folder-a',
			fileB: '/Users/l13rary/vscode/folder-b',
			label: 'Folder A ↔ Folder B',
		}];
		
	}

	public refresh () :void {
		
		this._onDidChangeTreeData.fire();
		
	}

	public getTreeItem (element:FavoriteTreeItem) :vscode.TreeItem {
		
		return element;
		
	}

	public getChildren (element?:FavoriteTreeItem) :Thenable<FavoriteTreeItem[]> {
		
		if (!this.favorites.length) {
			vscode.window.showInformationMessage('No favorites are available.');
			return Promise.resolve([]);
		}
		
		return Promise.resolve(this.favorites.map((favorite) => new FavoriteTreeItem(favorite)));

	}
	
	public static removeFavorite (node:Favorite) {
		
		//
		
	}
	
	public static clearFavorites () {
		
		//
		
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

//	Functions __________________________________________________________________

