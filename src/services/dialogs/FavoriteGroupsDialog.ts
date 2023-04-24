//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as vscode from 'vscode';

import type { Favorite, FavoriteGroup, FavoriteImport, ValidFavoriteImport } from '../../types';

import * as dialogs from '../common/dialogs';
import * as settings from '../common/settings';

import type { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import type { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________

const MAX_TOTAL_IMPORT = 1000;
const MAX_FILE_SIZE = 1024 * 1024;

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
	
	public async import () {
		
		const fsPath = await dialogs.openFile(options);
		
		if (fsPath) {
			const buttonDeleteAllAndImport = 'Delete All & Import';
			const result = await dialogs.confirm(`Import favorites from "${fsPath}"?`, 'Import', buttonDeleteAllAndImport);
			
			if (!result) return;
			if (result === buttonDeleteAllAndImport) this.favoritesState.clear();
			
			try {
				const stat = fs.statSync(fsPath);
				if (stat.size > MAX_FILE_SIZE) {
					vscode.window.showErrorMessage(`The file "${fsPath}" exceeds the size of 1 MB.`);
					return;
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Cannot find file "${fsPath}".`);
				return;
			}
			
			let content: string = null;
			
			try {
				content = fs.readFileSync(fsPath, 'utf-8');
			} catch (error) {
				vscode.window.showErrorMessage(`Cannot read file "${fsPath}".`);
				return;
			}
			
			let json: unknown = null;
			
			try {
				json = JSON.parse(content);
			} catch (error) {
				vscode.window.showErrorMessage(`Cannot parse JSON in file "${fsPath}".`);
				return;
			}
			
			if (Array.isArray(json)) {
				const favorites: FavoriteImport[] = [];
				let count = 0;
				loop: for (const item of <unknown[]> json) {
					if (!isValidFavoriteImport(item)) continue loop;
					if (exceedsImportRangeLimit(++count)) break loop;
					if (Array.isArray(item.favorites)) {
						const groupId = this.favoriteGroupsState.import(item.label).id;
						subloop: for (const favorite of <unknown[]> item.favorites) {
							if (!isValidFavoriteImport(favorite)) continue subloop;
							if (exceedsImportRangeLimit(++count)) break loop;
							prepareImportFavorite(favorites, favorite, groupId);
						}
					} else prepareImportFavorite(favorites, item);
				}
				
				this.favoritesState.import(favorites);
				
				vscode.window.showInformationMessage(`Imported ${count > MAX_TOTAL_IMPORT ? MAX_TOTAL_IMPORT : count} favorites and groups from "${fsPath}".`);
			} else {
				vscode.window.showErrorMessage('The JSON data is not an array.');
			}
		}
		
	}
	
}

//	Functions __________________________________________________________________

function isValidFavoriteImport (item: unknown): item is ValidFavoriteImport {
	
	return item && typeof item === 'object' && (<any> item).label && typeof (<any> item).label === 'string';
	
}

function prepareImportFavorite (favorites: FavoriteImport[], favorite: ValidFavoriteImport, groupId?: number) {
	
	favorites.push({
		label: favorite.label,
		pathA: typeof favorite.pathA === 'string' ? favorite.pathA : '',
		pathB: typeof favorite.pathB === 'string' ? favorite.pathB : '',
		groupId,
	});
	
}

function exceedsImportRangeLimit (total: number) {
	
	if (total > MAX_TOTAL_IMPORT) {
		vscode.window.showWarningMessage(`Import exceeds the limit of ${MAX_TOTAL_IMPORT} favorites or groups.`);
		return true;
	}
	
	return false;
	
}