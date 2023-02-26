//	Imports ____________________________________________________________________

import { join, resolve } from 'path';
import * as vscode from 'vscode';

import type { Favorite } from '../../../types';

//	Variables __________________________________________________________________

const basePath = resolve(__dirname, '..', 'images', 'favorites');
const iconPath = {
	light: join(basePath, 'favorite-item-light.svg'),
	dark: join(basePath, 'favorite-item-dark.svg'),
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteTreeItem extends vscode.TreeItem {
	
	public command = {
		arguments: [this],
		command: 'l13Diff.action.favorite.compare',
		title: 'Compare',
	};
	
	public iconPath = iconPath;
	
	public contextValue = 'favorite';
	
	public constructor (public readonly favorite: Favorite) {
		
		super(favorite.label);
		
		if (favorite.groupId !== undefined) this.contextValue = `sub${this.contextValue}`;
		
		this.tooltip = `${this.favorite.fileA} ↔ ${this.favorite.fileB}`;
		
	}
	
}

//	Functions __________________________________________________________________

