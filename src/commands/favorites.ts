//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';
import * as settings from '../common/settings';

import { DiffPanel } from '../services/panel/DiffPanel';
import { DiffFavorites } from '../services/sidebar/DiffFavorites';
import { FavoriteGroupTreeItem } from '../services/sidebar/trees/FavoriteGroupTreeItem';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	const diffFavoritesProvider = DiffFavorites.createProvider(context);
	const treeView = vscode.window.createTreeView('l13DiffFavorites', {
		treeDataProvider: diffFavoritesProvider,
		showCollapseAll: true,
	});
	
	subscriptions.push(treeView.onDidCollapseElement(({ element }) => DiffFavorites.saveCollapseState(context, <FavoriteGroupTreeItem>element, true)));
	subscriptions.push(treeView.onDidExpandElement(({ element }) => DiffFavorites.saveCollapseState(context, <FavoriteGroupTreeItem>element, false)));
	subscriptions.push(treeView);
	
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
		
		'l13Diff.action.favorite.rename': ({ favorite }) => DiffFavorites.renameFavorite(context, favorite),
		'l13Diff.action.favorite.remove': ({ favorite }) => DiffFavorites.removeFavorite(context, favorite),
		'l13Diff.action.favorites.group.add': () => DiffFavorites.addFavoriteGroup(context),
		
		'l13Diff.action.favorites.group.open': async ({ favoriteGroup }) => {
			
			const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
			const compare = settings.get('openFavoriteAndCompare', false);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
			}
			
		},
		
		'l13Diff.action.favorites.group.openOnly': async ({ favoriteGroup }) => {
			
			const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }]);
			}
			
		},
		
		'l13Diff.action.favorites.group.openAndCompare': async ({ favoriteGroup }) => {
			
			const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			}
			
		},
		
		'l13Diff.action.favorite.addToGroup': ({ favorite }) => DiffFavorites.addToFavoriteGroup(context, favorite),
		'l13Diff.action.favorite.removeFromGroup': ({ favorite }) => DiffFavorites.removeFromFavoriteGroup(context, favorite),
		'l13Diff.action.favorites.group.rename': ({ favoriteGroup }) => DiffFavorites.renameFavoriteGroup(context, favoriteGroup),
		'l13Diff.action.favorites.group.remove': ({ favoriteGroup }) => DiffFavorites.removeFavoriteGroup(context, favoriteGroup),
		'l13Diff.action.favorites.clear': () => DiffFavorites.clearFavorites(context),
		
	});
	
}

//	Functions __________________________________________________________________

