//	Imports ____________________________________________________________________

import type { FavoriteGroupTreeItem } from '../sidebar/trees/FavoriteGroupTreeItem';
import type { FavoriteTreeItem } from '../sidebar/trees/FavoriteTreeItem';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type FavoriteTreeItems = FavoriteTreeItem | FavoriteGroupTreeItem;

export type Favorite = {
	fileA: string;
	fileB: string;
	label: string;
	groupId?: number;
};

export type FavoriteGroup = {
	label: string;
	id: number;
	collapsed: boolean;
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

