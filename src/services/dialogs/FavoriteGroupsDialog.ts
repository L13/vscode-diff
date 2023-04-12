//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as vscode from 'vscode';

import type { Favorite, FavoriteGroup } from '../../types';

import { sanitize } from '../@l13/fse';

import * as dialogs from '../common/dialogs';
import * as settings from '../common/settings';

import type { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import type { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________

const findJSONExt = /\.json$/i;

const options = {
	filters: {
		Favorites: ['json'],
	},
};

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
	
	public async export () {
		
		const uri = await vscode.window.showSaveDialog(options);
		
		if (uri) {
			const favorites = this.favoritesState.get();
			const content = JSON.stringify([
				...this.favoriteGroupsState.get().map((favoriteGroup) => ({
					label: favoriteGroup.label,
					favorites: favorites
						.filter((favorite) => favoriteGroup.id === favorite.groupId)
						.map((favorite) => ({
							label: favorite.label,
							pathA: favorite.fileA,
							pathB: favorite.fileB,
						})),
				})),
				...favorites
					.filter((favorite) => typeof favorite.groupId === 'undefined')
					.map((favorite) => ({
						label: favorite.label,
						pathA: favorite.fileA,
						pathB: favorite.fileB,
					})),
			], null, '\t');
			let fsPath = uri.fsPath;
			if (!findJSONExt.test(fsPath)) fsPath += '.json';
			fs.writeFileSync(fsPath, content, 'utf-8');
		}
		
	}
	
	private importFavorite (label: string, pathA: string, pathB: string, groupId?: number) {
		
		let favorite = this.favoritesState.getByName(label);
		let favoriteLabel = label;
		
		if (favorite) {
			let count = 1;
			while (favorite) {
				favoriteLabel = `${label} (${count++})`;
				favorite = this.favoritesState.getByName(favoriteLabel);
			}
		}
		
		this.favoritesState.add(favoriteLabel, sanatizePath(pathA), sanatizePath(pathB), groupId);
		
	}
	
	public async import () {
		
		const fsPath = await dialogs.openFile(options);
		
		if (fsPath) {
			const buttonClearAndImport = 'Clear & Import';
			const result = await dialogs.confirm(`Import favorites from "${fsPath}"?`, 'Import', buttonClearAndImport);
			if (!result) return;
			if (result === buttonClearAndImport) this.favoritesState.clear();
			const json = JSON.parse(fs.readFileSync(fsPath, 'utf-8'));
			if (Array.isArray(json)) {
				json.forEach((item) => {
					
					const label = item.label;
					const favorites: any[] = item.favorites;
					
					if (Array.isArray(favorites)) {
						let favoriteGroup = this.favoriteGroupsState.getByName(label);
						
						if (!favoriteGroup) {
							this.favoriteGroupsState.add(label);
							favoriteGroup = this.favoriteGroupsState.getByName(label);
						}
						
						favorites.forEach((subitem) => this.importFavorite(subitem.label, subitem.pathA, subitem.pathB, favoriteGroup.id));
					} else this.importFavorite(label, item.pathA, item.pathB);
					
				});
				
				vscode.window.showInformationMessage(`Imported favorites from "${fsPath}"`);
			}
		}
		
	}
	
}

//	Functions __________________________________________________________________

function sanatizePath (path: string) {
		
	return typeof path === 'string' ? sanitize(path) : '';
	
}