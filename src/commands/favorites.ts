//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffSettings } from '../services/common/DiffSettings';
import { DiffPanel } from '../services/panel/DiffPanel';
import { DiffFavorites } from '../services/sidebar/DiffFavorites';
import { FavoriteGroupTreeItem } from '../services/sidebar/trees/FavoriteGroupTreeItem';

//	Variables __________________________________________________________________

const registerCommand = vscode.commands.registerCommand;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	const diffFavoritesProvider = DiffFavorites.createProvider(context);
	const treeView = vscode.window.createTreeView('l13DiffFavorites', {
		treeDataProvider: diffFavoritesProvider
	});
	
	treeView.onDidCollapseElement(({ element }) => DiffFavorites.collapseFavoriteGroup(context, <FavoriteGroupTreeItem>element));
	
	treeView.onDidExpandElement(({ element }) => DiffFavorites.expandFavoriteGroup(context, <FavoriteGroupTreeItem>element));
	
	subscriptions.push(treeView);
	
	subscriptions.push(registerCommand('l13Diff.openFavorite', ({ favorite }) => {
		
		const compare = DiffSettings.get('openFavoriteAndCompare', false);
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.openFavoriteOnly', ({ favorite }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], false);
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.openFavoriteAndCompare', ({ favorite }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.openFavoriteInNewPanel', ({ favorite }) => {
		
		DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.addToFavorites', () => DiffPanel.addToFavorites()));
	
	subscriptions.push(registerCommand('l13Diff.renameFavorite', ({ favorite }) => DiffFavorites.renameFavorite(context, favorite)));
	
	subscriptions.push(registerCommand('l13Diff.removeFavorite', ({ favorite }) => DiffFavorites.removeFavorite(context, favorite)));
	
	subscriptions.push(registerCommand('l13Diff.addFavoriteGroup', () => DiffFavorites.addFavoriteGroup(context)));
	
	subscriptions.push(registerCommand('l13Diff.openFavoriteGroup', async ({ favoriteGroup }) => {
		
		const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
		const compare = DiffSettings.get('openFavoriteAndCompare', false);
		
		for (const favorite of favorites) {
			await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
		}
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.openFavoriteGroupOnly', async ({ favoriteGroup }) => {
		
		const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
		
		for (const favorite of favorites) {
			await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }]);
		}
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.openFavoriteGroupAndCompare', async ({ favoriteGroup }) => {
		
		const favorites = DiffFavorites.getFavoritesByGroup(context, favoriteGroup);
		
		for (const favorite of favorites) {
			await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
		}
		
	}));
	
	subscriptions.push(registerCommand('l13Diff.addToFavoriteGroup', ({ favorite }) => DiffFavorites.addToFavoriteGroup(context, favorite)));
	
	subscriptions.push(registerCommand('l13Diff.removeFromFavoriteGroup', ({ favorite }) => DiffFavorites.removeFromFavoriteGroup(context, favorite)));
	
	subscriptions.push(registerCommand('l13Diff.renameFavoriteGroup', ({ favoriteGroup }) => DiffFavorites.renameFavoriteGroup(context, favoriteGroup)));
	
	subscriptions.push(registerCommand('l13Diff.removeFavoriteGroup', ({ favoriteGroup }) => DiffFavorites.removeFavoriteGroup(context, favoriteGroup)));
	
	subscriptions.push(registerCommand('l13Diff.clearFavorites', () => DiffFavorites.clearFavorites(context)));
	
}

//	Functions __________________________________________________________________

