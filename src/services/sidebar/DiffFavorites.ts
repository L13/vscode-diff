//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/natvies/arrays';
import { Favorite, FavoriteGroup, InitialState } from '../../types';

import { DiffDialog } from '../common/DiffDialog';
import { DiffSettings } from '../common/DiffSettings';
import { FavoriteGroupTreeItem } from './trees/FavoriteGroupTreeItem';
import { FavoriteTreeItem } from './trees/FavoriteTreeItem';

//	Variables __________________________________________________________________

const FAVORITES = 'favorites';
const FAVORITE_GROUPS = 'favoriteGroups';

const BUTTON_DELETE_GROUP_AND_FAVORITES = 'Delete Group and Favorites';

type FavoriteTreeItems = FavoriteTreeItem|FavoriteGroupTreeItem;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffFavorites implements vscode.TreeDataProvider<FavoriteTreeItems> {
	
	private _onDidChangeTreeData:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidChangeTreeData:vscode.Event<undefined> = this._onDidChangeTreeData.event;
	
	public favorites:Favorite[] = [];
	public favoriteGroups:FavoriteGroup[] = [];
	
	public disposables:vscode.Disposable[] = [];
	
	public static currentProvider:DiffFavorites|undefined;
	
	public static createProvider (context:vscode.ExtensionContext) {
		
		return DiffFavorites.currentProvider || (DiffFavorites.currentProvider = new DiffFavorites(context));
		
	}
	
	private constructor (private context:vscode.ExtensionContext) {
		
		this.favorites = this.context.globalState.get(FAVORITES) || [];
		this.favoriteGroups = this.context.globalState.get(FAVORITE_GROUPS, []);
		
		const initialState:InitialState = DiffSettings.get('initialFavoriteGroupState', 'Remember');
		
		if (initialState !== 'Remember') {
			this.favoriteGroups.forEach((favoriteGroup) => favoriteGroup.collapsed = initialState === 'Collapsed');
			this.context.globalState.update(FAVORITE_GROUPS, this.favoriteGroups);
		}
		
	}
	
	public dispose () :void {
		
		DiffFavorites.currentProvider = undefined;
		
	}
	
	public refresh () :void {
		
		this.favorites = this.context.globalState.get(FAVORITES) || [];
		this.favoriteGroups = this.context.globalState.get(FAVORITE_GROUPS, []);
		
		this._onDidChangeTreeData.fire(undefined);
		
	}
	
	public getTreeItem (element:FavoriteTreeItems) :vscode.TreeItem {
		
		return element;
		
	}
	
	public getChildren (element?:FavoriteTreeItems) :Thenable<FavoriteTreeItems[]> {
		
		const list:FavoriteTreeItems[] = [];
		
		if (!this.favorites.length && !this.favoriteGroups.length) return Promise.resolve(list);
		
		if (element) {
			const groupId = (<FavoriteGroupTreeItem>element).favoriteGroup.id;
			this.favorites.filter((favorite) => favorite.groupId === groupId).forEach((favorite) => list.push(new FavoriteTreeItem(favorite)));
		} else {
			this.favoriteGroups.forEach((favoriteGroup) => list.push(new FavoriteGroupTreeItem(favoriteGroup)));
			this.favorites.filter((favorite) => favorite.groupId === undefined).forEach((favorite) => list.push(new FavoriteTreeItem(favorite)));
		}
		
		return Promise.resolve(list);
		
	}
	
	public static async addFavorite (context:vscode.ExtensionContext, fileA:string, fileB:string) {
		
		const label = await vscode.window.showInputBox({ value: `${fileA} ↔ ${fileB}` });
		
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
			const value = await DiffDialog.confirm(`Overwrite favorite "${favorite.label}"?`, 'Ok');
			if (value) {
				favorites[index] = favorite;
				saveFavorite(context, favorites);
			}
		}
		
	}
	
	public static async renameFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const value = await vscode.window.showInputBox({ value: favorite.label });
		
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
					DiffFavorites.currentProvider?.refresh();
				} else vscode.window.showErrorMessage(`Favorite "${value}" exists!`);
				break;
			}
		}
		
	}
	
	public static async removeFavorite (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const value = await DiffDialog.confirm(`Delete favorite "${favorite.label}"?`, 'Delete');
		
		if (value) {
			const favorites:Favorite[] = context.globalState.get(FAVORITES) || [];
			
			for (let i = 0; i < favorites.length; i++) {
				if (favorites[i].label === favorite.label) {
					favorites.splice(i, 1);
					context.globalState.update(FAVORITES, favorites);
					DiffFavorites.currentProvider?.refresh();
					return;
				}
			}
			
			vscode.window.showErrorMessage(`Favorite does not exist`);
		}
		
	}
	
	public static async addFavoriteGroup (context:vscode.ExtensionContext) {
		
		const label = await vscode.window.showInputBox();
		
		if (!label) return;
		
		const favoriteGroups:FavoriteGroup[] = context.globalState.get(FAVORITE_GROUPS, []);
		const groupId:number = getNextGroupId(favoriteGroups);
		const favoriteGroup:FavoriteGroup = { label, id: groupId, collapsed: false };
		let index = -1;
		
		for (let i = 0; i < favoriteGroups.length; i++) {
			if (favoriteGroups[i].label === label) {
				index = i;
				break;
			}
		}
		
		if (index === -1) {
			favoriteGroups.push(favoriteGroup);
			saveFavoriteGroup(context, favoriteGroups);
		} else vscode.window.showErrorMessage(`Favorite group "${label}" exists!`);
		
	}
	
	public static getFavoritesByGroup (context:vscode.ExtensionContext, favoriteGroup:FavoriteGroup) {
		
		const favorites = context.globalState.get(FAVORITES, []);
		
		return favorites.filter((favorite) => favorite.groupId === favoriteGroup.id);
		
	}
	
	public static async addToFavoriteGroup (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const favoriteGroups:FavoriteGroup[] = context.globalState.get(FAVORITE_GROUPS, []);
		const favorites:Favorite[] = context.globalState.get(FAVORITES, []);
		const favoriteGroup = await vscode.window.showQuickPick(favoriteGroups);
		
		if (favoriteGroup) {
			favorites.some((fav) => {
				
				if (fav.label === favorite.label) {
					fav.groupId = favoriteGroup.id;
					return true;
				}
				
				return false;
				
			});
			context.globalState.update(FAVORITES, favorites);
			DiffFavorites.currentProvider?.refresh();
		}
		
	}
	
	public static removeFromFavoriteGroup (context:vscode.ExtensionContext, favorite:Favorite) {
		
		const favorites:Favorite[] = context.globalState.get(FAVORITES, []);
		
		favorites.some((fav) => {
			
			if (fav.label === favorite.label) {
				delete fav.groupId;
				return true;
			}
			
			return false;
			
		});
		
		context.globalState.update(FAVORITES, favorites);
		DiffFavorites.currentProvider?.refresh();
		
	}
	
	public static collapseFavoriteGroup (context:vscode.ExtensionContext, item:FavoriteGroupTreeItem) {
		
		const favoriteGroups:FavoriteGroup[] = context.globalState.get(FAVORITE_GROUPS, []);
		
		favoriteGroups.some((favoriteGroup) => {
			
			if (favoriteGroup.label === item.label) return favoriteGroup.collapsed = true;
			
			return false;
			
		});
		
		context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
		DiffFavorites.currentProvider?.refresh();
		
	}
	
	public static expandFavoriteGroup (context:vscode.ExtensionContext, item:FavoriteGroupTreeItem) {
		
		const favoriteGroups:FavoriteGroup[] = context.globalState.get(FAVORITE_GROUPS, []);
		
		favoriteGroups.some((favoriteGroup) => {
			
			if (favoriteGroup.label === item.label) return !(favoriteGroup.collapsed = false);
			
			return false;
			
		});
		
		context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
		DiffFavorites.currentProvider?.refresh();
		
	}
	
	public static async renameFavoriteGroup (context:vscode.ExtensionContext, favoriteGroup:FavoriteGroup) {
		
		const value = await vscode.window.showInputBox({ value: favoriteGroup.label });
		
		if (favoriteGroup.label === value || value === undefined) return;
		
		if (!value) {
			vscode.window.showErrorMessage(`Favorite group with no name is not valid!`);
			return;
		}
		
		const favoriteGroups:FavoriteGroup[] = context.globalState.get(FAVORITE_GROUPS, []);
		
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < favoriteGroups.length; i++) {
			if (favoriteGroups[i].label === favoriteGroup.label) {
				if (!favoriteGroups.some(({ label }) => label === value)) {
					favoriteGroups[i].label = value;
					favoriteGroups.sort(({ label:a}, { label:b }) => sortCaseInsensitive(a, b));
					context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
					DiffFavorites.currentProvider?.refresh();
				} else vscode.window.showErrorMessage(`Favorite group "${value}" exists!`);
				break;
			}
		}
		
	}
	
	public static async removeFavoriteGroup (context:vscode.ExtensionContext, favoriteGroup:FavoriteGroup) {
		
		const value = await DiffDialog.confirm(`Delete favorite group "${favoriteGroup.label}"?`, 'Delete', BUTTON_DELETE_GROUP_AND_FAVORITES);
		
		if (value) {
			const favoriteGroups:FavoriteGroup[] = context.globalState.get(FAVORITE_GROUPS, []);
			
			for (let i = 0; i < favoriteGroups.length; i++) {
				if (favoriteGroups[i].label === favoriteGroup.label) {
					let favorites:Favorite[] = context.globalState.get(FAVORITES, []);
					favoriteGroups.splice(i, 1);
					if (value === BUTTON_DELETE_GROUP_AND_FAVORITES) {
						favorites = favorites.filter((favorite) => favorite.groupId !== favoriteGroup.id);
					} else {
						favorites.forEach((favorite) => {
						
							if (favorite.groupId === favoriteGroup.id) delete favorite.groupId;
							
						});
					}
					context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
					context.globalState.update(FAVORITES, favorites);
					DiffFavorites.currentProvider?.refresh();
					return;
				}
			}
			
			vscode.window.showErrorMessage(`Favorite group "${favoriteGroup.label}" does not exist!`);
		}
		
	}
	
	public static async clearFavorites (context:vscode.ExtensionContext) {
		
		const value = await DiffDialog.confirm(`Delete all favorites and groups?'`, 'Delete');
		
		if (value) {
			context.globalState.update(FAVORITES, []);
			context.globalState.update(FAVORITE_GROUPS, []);
			DiffFavorites.currentProvider?.refresh();
		}
		
	}
	
}

//	Functions __________________________________________________________________

function saveFavorite (context:vscode.ExtensionContext, favorites:Favorite[]) {
	
	favorites.sort(({ label:a }, { label:b }) => sortCaseInsensitive(a, b));
	context.globalState.update(FAVORITES, favorites);
	DiffFavorites.currentProvider?.refresh();
	
}

function saveFavoriteGroup (context:vscode.ExtensionContext, favoriteGroups:FavoriteGroup[]) {
	
	favoriteGroups.sort(({ label:a }, { label:b }) => sortCaseInsensitive(a, b));
	context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
	DiffFavorites.currentProvider?.refresh();
	
}

function getNextGroupId (favoriteGroups:FavoriteGroup[]) :number {
	
	if (!favoriteGroups.length) return 0;
	
	const groupIds = favoriteGroups.map((favoriteGroup) => favoriteGroup.id);
	const maxGroupId = Math.max.apply(null, groupIds);
	let i = 0;
	
	while (i <= maxGroupId) {
		if (!favoriteGroups.some((favoriteGroup) => favoriteGroup.id === i)) return i;
		i++;
	}
	
	return i;
	
}