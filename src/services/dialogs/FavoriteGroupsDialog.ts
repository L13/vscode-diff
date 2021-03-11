//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Favorite, FavoriteGroup } from '../@types/favorites';

import * as dialogs from '../common/dialogs';

import { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteGroupsDialog {
	
	private static current:FavoriteGroupsDialog = null;
	
	public static create (favoriteGroupsState:FavoriteGroupsState, favoritesState:FavoritesState) {
		
		return FavoriteGroupsDialog.current || (FavoriteGroupsDialog.current = new FavoriteGroupsDialog(favoriteGroupsState, favoritesState));
		
	}
	
	public constructor (private readonly favoriteGroupsState:FavoriteGroupsState, private readonly favoritesState:FavoritesState) {}
	
	public async add () {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a name for the group.',
		});
		
		if (!label) return;
		
		if (this.favoriteGroupsState.getByName(label)) {
			vscode.window.showInformationMessage(`Favorite group with name "${label}" exists!`);
			return;
		}
		
		this.favoriteGroupsState.add(label);
		
		return this.favoriteGroupsState.getByName(label);
		
	}
	
	public async addFavoriteToGroup (favorite:Favorite) {
		
		const favoriteGroups = this.favoriteGroupsState.get();
		let favoriteGroup:FavoriteGroup = null;
		
		if (favoriteGroups.length) {
			const newFavoriteGroupItem = { label: 'New Group ...' };
			const items = [
				newFavoriteGroupItem,
				...favoriteGroups
			];
			const selectedItem = await vscode.window.showQuickPick(items, {
				placeHolder: 'Select a favorite group',
			});
			if (selectedItem === newFavoriteGroupItem) {
				favoriteGroup = await this.add();
			} else favoriteGroup = <FavoriteGroup>selectedItem;
		} else favoriteGroup = await this.add();
		
		if (!favoriteGroup) return;
		
		this.favoritesState.addFavoriteToGroup(favorite, favoriteGroup.id);
		
	}
	
	public async rename (favoriteGroup:FavoriteGroup) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a new name for the group.',
			value: favoriteGroup.label,
		});
		
		if (!label || favoriteGroup.label === label) return;
		
		if (this.favoriteGroupsState.getByName(label)) {
			vscode.window.showInformationMessage(`Favorite group with name "${label}" exists!`);
			return;
		}
		
		this.favoriteGroupsState.rename(favoriteGroup, label);
		
	}
	
	public async remove (favoriteGroup:FavoriteGroup) {
		
		const BUTTON_DELETE_GROUP_AND_FAVORITES = 'Delete Group and Favorites';
		const buttons = ['Delete'];
		const favorites = this.favoritesState.getFavoritesByGroup(favoriteGroup);
		
		if (favorites.length) buttons.push(BUTTON_DELETE_GROUP_AND_FAVORITES);
		
		const value = await dialogs.confirm(`Delete favorite group "${favoriteGroup.label}"?`, ...buttons);
		
		if (!value) return;
		
		this.favoriteGroupsState.remove(favoriteGroup, value === BUTTON_DELETE_GROUP_AND_FAVORITES);
		
	}
	
}

//	Functions __________________________________________________________________

