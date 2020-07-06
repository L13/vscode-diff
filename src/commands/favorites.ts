//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as settings from '../common/settings';

import { DiffPanel } from '../services/panel/DiffPanel';
import { DiffFavorites } from '../services/sidebar/DiffFavorites';
import { FavoriteGroupTreeItem } from '../services/sidebar/trees/FavoriteGroupTreeItem';

import { register } from '../common/commands';

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
	
	treeView.onDidCollapseElement(({ element }) => DiffFavorites.saveCollapseState(context, <FavoriteGroupTreeItem>element, true));
	
	treeView.onDidExpandElement(({ element }) => DiffFavorites.saveCollapseState(context, <FavoriteGroupTreeItem>element, false));
	
	subscriptions.push(treeView);
	
	register(context, {
	
		'l13Diff.openFavorite': ({ favorite }) => {
			
			const compare = settings.get('openFavoriteAndCompare', false);
			
			DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
			
		},
		
		'l13Diff.openFavoriteOnly': ({ favorite }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], false);
			
		},
		
		'l13Diff.openFavoriteAndCompare': ({ favorite }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			
		},
		
		'l13Diff.openFavoriteInNewPanel': ({ favorite }) => {
			
			DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			
		},
		
		'l13Diff.addToFavorites': () => DiffPanel.addToFavorites(),
		'l13Diff.renameFavorite': ({ favorite }) => DiffFavorites.renameFavorite(context, favorite),
		'l13Diff.removeFavorite': ({ favorite }) => DiffFavorites.removeFavorite(context, favorite),
		'l13Diff.addFavoriteGroup': () => DiffFavorites.addFavoriteGroup(context),
		
		'l13Diff.openFavoriteGroup': async ({ favoriteGroup }) => {
			
			const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
			const compare = settings.get('openFavoriteAndCompare', false);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
			}
			
		},
		
		'l13Diff.openFavoriteGroupOnly': async ({ favoriteGroup }) => {
			
			const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }]);
			}
			
		},
		
		'l13Diff.openFavoriteGroupAndCompare': async ({ favoriteGroup }) => {
			
			const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
			
			for (const favorite of favorites) {
				await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			}
			
		},
		
		'l13Diff.addToFavoriteGroup': ({ favorite }) => DiffFavorites.addToFavoriteGroup(context, favorite),
		'l13Diff.removeFromFavoriteGroup': ({ favorite }) => DiffFavorites.removeFromFavoriteGroup(context, favorite),
		'l13Diff.renameFavoriteGroup': ({ favoriteGroup }) => DiffFavorites.renameFavoriteGroup(context, favoriteGroup),
		'l13Diff.removeFavoriteGroup': ({ favoriteGroup }) => DiffFavorites.removeFavoriteGroup(context, favoriteGroup),
		'l13Diff.clearFavorites': () => DiffFavorites.clearFavorites(context),
		
	});
	
}

//	Functions __________________________________________________________________

