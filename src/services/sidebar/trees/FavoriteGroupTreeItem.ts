//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { FavoriteGroup } from '../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteGroupTreeItem extends vscode.TreeItem {
	
	// triggers the tree view to recreate all items for collapse all
	private static stateVersion:number = 0;
	
	public static updateStateVersion () {
		
		FavoriteGroupTreeItem.stateVersion = 1 - FavoriteGroupTreeItem.stateVersion;
		
	}
	
	public contextValue = 'favoriteGroup';
	
	public constructor (public readonly favoriteGroup:FavoriteGroup) {
		
		super(favoriteGroup.label, favoriteGroup.collapsed ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded);
		
		this.id = `${favoriteGroup.id}-${FavoriteGroupTreeItem.stateVersion}`;
		
	}
	
}

//	Functions __________________________________________________________________

