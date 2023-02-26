//	Imports ____________________________________________________________________

import { TreeItemCollapsibleState, TreeItem } from 'vscode';

import type { FavoriteGroup } from '../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteGroupTreeItem extends TreeItem {
	
	public contextValue = 'favoriteGroup';
	
	public constructor (public readonly favoriteGroup: FavoriteGroup) {
		
		super(favoriteGroup.label, favoriteGroup.collapsed ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.Expanded);
		
		this.id = `${favoriteGroup.id}`;
		
	}
	
}

//	Functions __________________________________________________________________

