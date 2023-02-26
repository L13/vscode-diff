//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Favorite, FavoriteGroup } from '../../types';

import * as dialogs from '../common/dialogs';
import * as settings from '../common/settings';

import type { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import type { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteGroupsDialog {
	
	private static current: FavoriteGroupsDialog = null;
	
	public static create (favoriteGroupsState: FavoriteGroupsState, favoritesState: FavoritesState) {
		
		return FavoriteGroupsDialog.current || (FavoriteGroupsDialog.current = new FavoriteGroupsDialog(favoriteGroupsState, favoritesState));
		
	}
	
	private constructor (private readonly favoriteGroupsState: FavoriteGroupsState, private readonly favoritesState: FavoritesState) {}
	
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
	
	public async addFavoriteToGroup (favorite: Favorite) {
		
		const favoriteGroups = this.favoriteGroupsState.get();
		let favoriteGroup: FavoriteGroup = null;
		
		if (favoriteGroups.length) {
			const newFavoriteGroupItem = { label: '$(add) New Group...' };
			const items = [
				newFavoriteGroupItem,
				...favoriteGroups,
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
	
	public async openMultipleDiffPanels (favoriteGroup: FavoriteGroup) {
		
		const favorites = this.favoritesState.getFavoritesByGroup(favoriteGroup);
		
		if (favorites.length > 3 && settings.get('confirmOpenMultipleDiffPanels', true)) {
			const buttonCompareDontShowAgain = 'Compare, don\'t show again';
			const text = `Open "${favoriteGroup.label}" with ${favorites.length} comparisons in multiple diff panels at once?`;
			const value = await dialogs.confirm(text, 'Compare', buttonCompareDontShowAgain);
			if (!value) return null;
			if (value === buttonCompareDontShowAgain) settings.update('confirmOpenMultipleDiffPanels', false);
		}
		
		return favorites;
		
	}
	
	public async rename (favoriteGroup: FavoriteGroup) {
		
		const label = await vscode.window.showInputBox({
			placeHolder: 'Please enter a new name for the group.',
			value: favoriteGroup.label,
		});
		
		if (!label || favoriteGroup.label === label) return;
		
		if (this.favoriteGroupsState.getByName(label)) {
			vscode.window.showInformationMessage(`Favorite group with name "${label}" exists!`);
			return;
		}
		
		this.favoriteGroupsState.rename(favoriteGroup, label);
		
	}
	
	public async remove (favoriteGroup: FavoriteGroup) {
		
		const buttonDeleteGroupAndFavorites = 'Delete Group and Favorites';
		const buttons = ['Delete'];
		const favorites = this.favoritesState.getFavoritesByGroup(favoriteGroup);
		
		if (favorites.length) buttons.push(buttonDeleteGroupAndFavorites);
		
		const value = await dialogs.confirm(`Delete favorite group "${favoriteGroup.label}"?`, ...buttons);
		
		if (!value) return;
		
		this.favoriteGroupsState.remove(favoriteGroup, value === buttonDeleteGroupAndFavorites);
		
	}
	
}

//	Functions __________________________________________________________________

