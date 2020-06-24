//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { Favorite } from '../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteTreeItem extends vscode.TreeItem {
	
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
		
		if (favorite.groupId !== undefined) this.contextValue = `sub${this.contextValue}`;
		
	}
	
	public get tooltip () :string {
		
		return `${this.favorite.fileA} ↔ ${this.favorite.fileB}`;
		
	}
	
}

//	Functions __________________________________________________________________

