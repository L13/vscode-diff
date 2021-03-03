//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/arrays';

import { Favorite, FavoriteGroup } from '../@types/favorites';

import * as dialogs from '../common/dialogs';
import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteGroupsState {
	
	private static currentFavoriteGroupsState:FavoriteGroupsState = null;
	
	public static createFavoriteGroupsState (context:vscode.ExtensionContext) {
		
		return FavoriteGroupsState.currentFavoriteGroupsState || (FavoriteGroupsState.currentFavoriteGroupsState = new FavoriteGroupsState(context));
		
	}
	
	public constructor (private readonly context:vscode.ExtensionContext) {}
	
	private _onDidUpdateFavorites:vscode.EventEmitter<Favorite[]> = new vscode.EventEmitter<Favorite[]>();
	public readonly onDidUpdateFavorites:vscode.Event<Favorite[]> = this._onDidUpdateFavorites.event;
	
	private _onDidUpdateFavoriteGroup:vscode.EventEmitter<FavoriteGroup> = new vscode.EventEmitter<FavoriteGroup>();
	public readonly onDidUpdateFavoriteGroup:vscode.Event<FavoriteGroup> = this._onDidUpdateFavoriteGroup.event;
	
	private _onDidDeleteFavoriteGroup:vscode.EventEmitter<FavoriteGroup> = new vscode.EventEmitter<FavoriteGroup>();
	public readonly onDidDeleteFavoriteGroup:vscode.Event<FavoriteGroup> = this._onDidDeleteFavoriteGroup.event;
	
	private _onDidChangeFavoriteGroups:vscode.EventEmitter<FavoriteGroup[]> = new vscode.EventEmitter<FavoriteGroup[]>();
	public readonly onDidChangeFavoriteGroups:vscode.Event<FavoriteGroup[]> = this._onDidChangeFavoriteGroups.event;
	
	public getFavoriteGroups () {
		
		return states.getFavoriteGroups(this.context);
		
	}
	
	public async addFavoriteGroup () {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a name for the group.',
		});
		
		if (!label) return;
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		
		for (const favoriteGroup of favoriteGroups) {
			if (favoriteGroup.label === label) {
				return vscode.window.showErrorMessage(`Favorite group "${label}" exists!`);
			}
		}
		
		favoriteGroups.push({ label, id: getNextGroupId(favoriteGroups), collapsed: false });
		favoriteGroups.sort(({ label:a }, { label:b }) => sortCaseInsensitive(a, b));
		states.updateFavoriteGroups(this.context, favoriteGroups);
		this._onDidChangeFavoriteGroups.fire(favoriteGroups);
		
	}
	
	public getFavoritesByGroup (favoriteGroup:FavoriteGroup) {
		
		const favorites = states.getFavorites(this.context);
		
		return favorites.filter((favorite) => favorite.groupId === favoriteGroup.id);
		
	}
	
	public async addToFavoriteGroup (favorite:Favorite) {
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		
		if (!favoriteGroups.length) await this.addFavoriteGroup();
		
		const favoriteGroup = favoriteGroups.length > 1 ? await vscode.window.showQuickPick(favoriteGroups) : favoriteGroups[0];
		const favorites = states.getFavorites(this.context);
		
		if (favoriteGroup) {
			favorites.some((fav) => {
				
				if (fav.label === favorite.label) {
					fav.groupId = favoriteGroup.id;
					return true;
				}
				
				return false;
				
			});
			states.updateFavorites(this.context, favorites);
			this._onDidUpdateFavorites.fire(favorites);
		}
		
	}
	
	public removeFromFavoriteGroup (favorite:Favorite) {
		
		const favorites = states.getFavorites(this.context);
		
		favorites.some((fav) => {
			
			if (fav.label === favorite.label) {
				delete fav.groupId;
				return true;
			}
			
			return false;
			
		});
		
		states.updateFavorites(this.context, favorites);
		this._onDidUpdateFavorites.fire(favorites);
		
	}
	
	public async renameFavoriteGroup (favoriteGroup:FavoriteGroup) {
		
		const value = await vscode.window.showInputBox({
			placeHolder: 'Please enter a new name for the group.',
			value: favoriteGroup.label,
		});
		
		if (!value || favoriteGroup.label === value) return;
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		const groupId = favoriteGroup.id;
		
		for (const group of favoriteGroups) {
			if (group.id === groupId) {
				group.label = value;
				favoriteGroups.sort(({ label:a}, { label:b }) => sortCaseInsensitive(a, b));
				states.updateFavoriteGroups(this.context, favoriteGroups);
				this._onDidUpdateFavoriteGroup.fire(group);
				break;
			}
		}
		
	}
	
	public async removeFavoriteGroup (favoriteGroup:FavoriteGroup) {
		
		const BUTTON_DELETE_GROUP_AND_FAVORITES = 'Delete Group and Favorites';
		const value = await dialogs.confirm(`Delete favorite group "${favoriteGroup.label}"?`, 'Delete', BUTTON_DELETE_GROUP_AND_FAVORITES);
		
		if (value) {
			const favoriteGroups = states.getFavoriteGroups(this.context);
			const groupId = favoriteGroup.id;
			
			for (let i = 0; i < favoriteGroups.length; i++) {
				if (favoriteGroups[i].id === groupId) {
					favoriteGroups.splice(i, 1);
					let favorites = states.getFavorites(this.context);
					if (value === BUTTON_DELETE_GROUP_AND_FAVORITES) {
						favorites = favorites.filter((favorite) => favorite.groupId !== favoriteGroup.id);
					} else {
						favorites.forEach((favorite) => {
						
							if (favorite.groupId === favoriteGroup.id) delete favorite.groupId;
							
						});
					}
					states.updateFavoriteGroups(this.context, favoriteGroups);
					states.updateFavorites(this.context, favorites);
					this._onDidDeleteFavoriteGroup.fire(favoriteGroup);
					break;
				}
			}
		}
		
	}
	
	public saveCollapseState (favoriteGroup:FavoriteGroup, collapsed:boolean) {
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		const groupId = favoriteGroup.id;
		
		favoriteGroups.some((group) => group.id === groupId ? (group.collapsed = collapsed) || true : false);
		
		states.updateFavoriteGroups(this.context, favoriteGroups);
		
	}
	
}

//	Functions __________________________________________________________________

function getNextGroupId (favoriteGroups:FavoriteGroup[]) :number {
	
	if (!favoriteGroups.length) return 0;
	
	const groupIds = favoriteGroups.map((favoriteGroup) => favoriteGroup.id);
	const maxGroupId = Math.max.apply(null, groupIds);
	let i = 0;
	
	while (i <= maxGroupId) {
		if (!groupIds.includes(i)) return i;
		i++;
	}
	
	return i;
	
}