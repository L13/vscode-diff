//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';
import * as settings from '../common/settings';

import { DiffPanel } from '../panel/DiffPanel';
import { FavoritesProvider } from '../sidebar/FavoritesProvider';
import { FavoriteGroupTreeItem } from '../sidebar/trees/FavoriteGroupTreeItem';
import { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	
	const favoritesState = FavoritesState.createFavoritesState(context);
	const favoriteGroupsState = FavoriteGroupsState.createFavoriteGroupsState(context);
	const favoritesProvider = FavoritesProvider.createProvider({
		favorites: favoritesState.getFavorites(),
		favoriteGroups: favoriteGroupsState.getFavoriteGroups(),
	});
	const treeView = vscode.window.createTreeView('l13DiffFavorites', {
		treeDataProvider: favoritesProvider,
		showCollapseAll: true,
	});
	
	subscriptions.push(treeView.onDidCollapseElement(({ element }) => {
		
		favoriteGroupsState.saveCollapseState((<FavoriteGroupTreeItem>element).favoriteGroup, true);
		
	}));
	
	subscriptions.push(treeView.onDidExpandElement(({ element }) => {
		
		favoriteGroupsState.saveCollapseState((<FavoriteGroupTreeItem>element).favoriteGroup, false);
		
	}));
	
	subscriptions.push(treeView);
	
	subscriptions.push(vscode.window.onDidChangeWindowState(({ focused }) => {
		
		if (focused) { // Update data if changes in another workspace have been done
			favoritesProvider.refresh({
				favorites: favoritesState.getFavorites(),
				favoriteGroups: favoriteGroupsState.getFavoriteGroups(),
			});
		}
		
	}));
	
	subscriptions.push(favoritesState.onDidChangeFavorites((favorites) => {
		
		favoritesProvider.refresh({
			favorites,
		});
		
	}));
	
	subscriptions.push(favoritesState.onDidUpdateFavorite(() => {
		
		favoritesProvider.refresh({
			favorites: favoritesState.getFavorites(),
		});
		
	}));
	
	subscriptions.push(favoritesState.onDidDeleteFavorite(() => {
		
		favoritesProvider.refresh({
			favorites: favoritesState.getFavorites(),
		});
		
	}));
	
	subscriptions.push(favoriteGroupsState.onDidUpdateFavorites((favorites) => {
		
		favoritesProvider.refresh({
			favorites,
		});
		
	}));
	
	subscriptions.push(favoriteGroupsState.onDidChangeFavoriteGroups((favoriteGroups) => {
		
		favoritesProvider.refresh({
			favorites: favoritesState.getFavorites(),
			favoriteGroups,
		});
		
	}));
	
	subscriptions.push(favoriteGroupsState.onDidUpdateFavoriteGroup(() => {
		
		favoritesProvider.refresh({
			favorites: favoritesState.getFavorites(),
			favoriteGroups: favoriteGroupsState.getFavoriteGroups(),
		});
		
	}));
	
	subscriptions.push(favoriteGroupsState.onDidDeleteFavoriteGroup(() => {
		
		favoritesProvider.refresh({
			favorites: favoritesState.getFavorites(),
			favoriteGroups: favoriteGroupsState.getFavoriteGroups(),
		});
		
	}));
	
	commands.register(context, {
	
		'l13Diff.action.favorite.open': ({ favorite }) => {
			
			const compare = settings.get('openFavoriteAndCompare', false);
			
			DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
			
		},
		
		'l13Diff.action.favorite.openOnly': ({ favorite }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], false);
			
		},
		
		'l13Diff.action.favorite.openAndCompare': ({ favorite }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			
		},
		
		'l13Diff.action.favorite.openInNewPanel': ({ favorite }) => {
			
			DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			
		},
		
		'l13Diff.action.favorite.rename': ({ favorite }) => favoritesState.renameFavorite(favorite),
		'l13Diff.action.favorite.remove': ({ favorite }) => favoritesState.removeFavorite(favorite),
		
		'l13Diff.action.favorites.group.add': () => favoriteGroupsState.addFavoriteGroup(),
		
		'l13Diff.action.favorites.group.open': async ({ favoriteGroup }) => {
			
			const favorites = favoriteGroupsState.getFavoritesByGroup(favoriteGroup);
			const compare = settings.get('openFavoriteAndCompare', false);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
			}
			
		},
		
		'l13Diff.action.favorites.group.openOnly': async ({ favoriteGroup }) => {
			
			const favorites = favoriteGroupsState.getFavoritesByGroup(favoriteGroup);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }]);
			}
			
		},
		
		'l13Diff.action.favorites.group.openAndCompare': async ({ favoriteGroup }) => {
			
			const favorites = favoriteGroupsState.getFavoritesByGroup(favoriteGroup);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			}
			
		},
		
		'l13Diff.action.favorite.addToGroup': ({ favorite }) => favoriteGroupsState.addToFavoriteGroup(favorite),
		'l13Diff.action.favorite.removeFromGroup': ({ favorite }) => favoriteGroupsState.removeFromFavoriteGroup(favorite),
		'l13Diff.action.favorites.group.rename': ({ favoriteGroup }) => favoriteGroupsState.renameFavoriteGroup(favoriteGroup),
		'l13Diff.action.favorites.group.remove': ({ favoriteGroup }) => favoriteGroupsState.removeFavoriteGroup(favoriteGroup),
		
		'l13Diff.action.favorites.clear': () => favoritesState.clearFavorites(),
		
	});
	
}

//	Functions __________________________________________________________________

