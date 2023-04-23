//	Imports ____________________________________________________________________

import type { FavoriteGroupTreeItem } from '../sidebar/trees/FavoriteGroupTreeItem';
import type { FavoriteTreeItem } from '../sidebar/trees/FavoriteTreeItem';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type FavoriteTreeItems = FavoriteTreeItem | FavoriteGroupTreeItem;

export type Favorite = {
	label: string,
	fileA: string,
	fileB: string,
	groupId?: number,
};

export type FavoriteImport = {
	label: string,
	pathA: string,
	pathB: string,
	groupId?: number,
};

export type ValidFavoriteImport = {
	label: string,
	[key: string]: unknown,
};

export type FavoriteGroup = {
	label: string,
	id: number,
	collapsed: boolean,
};

export type InitialState = 'collapsed' | 'expanded' | 'remember';

export type FavoritesStates = {
	favorites: Favorite[],
	favoriteGroups: FavoriteGroup[],
};

export type RefreshFavoritesStates = {
	favorites?: Favorite[],
	favoriteGroups?: FavoriteGroup[],
};

//	Functions __________________________________________________________________

