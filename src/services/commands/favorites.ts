//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Favorite } from '../@types/favorites';

import * as commands from '../common/commands';
import * as settings from '../common/settings';

import { FavoriteGroupsDialog } from '../dialogs/FavoriteGroupsDialog';
import { FavoritesDialog } from '../dialogs/FavoritesDialog';

import { DiffPanel } from '../panel/DiffPanel';

import { FavoritesProvider } from '../sidebar/FavoritesProvider';
import { FavoriteGroupTreeItem } from '../sidebar/trees/FavoriteGroupTreeItem';
import { FavoriteTreeItem } from '../sidebar/trees/FavoriteTreeItem';

import { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import { FavoritesState } from '../states/FavoritesState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	
	const favoritesState = FavoritesState.create(context);
	const favoriteGroupsState = FavoriteGroupsState.create(context);
	const favoritesDialog = FavoritesDialog.create(favoritesState);
	const favoriteGroupsDialog = FavoriteGroupsDialog.create(favoriteGroupsState, favoritesState);
	const favoritesProvider = FavoritesProvider.create({
		favorites: favoritesState.get(),
		favoriteGroups: favoriteGroupsState.get(),
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
	
	subscriptions.push(favoritesState.onDidChangeFavorites((favorites) => {
		
		favoritesProvider.refresh({
			favorites,
		});
		
	}));
	
	subscriptions.push(favoriteGroupsState.onDidChangeFavoriteGroups((favoriteGroups) => {
		
		favoritesProvider.refresh({
			favorites: favoritesState.get(),
			favoriteGroups,
		});
		
	}));
	
	commands.register(context, {
	
		'l13Diff.action.favorite.open': ({ favorite }:FavoriteTreeItem) => {
			
			openFavorite(context, favorite, settings.get('openFavoriteAndCompare', false));
			
		},
		
		'l13Diff.action.favorite.openOnly': ({ favorite }:FavoriteTreeItem) => openFavorite(context, favorite, false),
		'l13Diff.action.favorite.openAndCompare': ({ favorite }:FavoriteTreeItem) => openFavorite(context, favorite, true),
		
		'l13Diff.action.favorite.openInNewPanel': ({ favorite }:FavoriteTreeItem) => {
			
			DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
			
		},
		
		'l13Diff.action.favorite.revealInFinder': ({ favorite }:FavoriteTreeItem) => {
			
			favoritesDialog.reveal([favorite.fileA, favorite.fileB]);
			
		},
		
		'l13Diff.action.favorite.revealInExplorer': ({ favorite }:FavoriteTreeItem) => {
			
			favoritesDialog.reveal([favorite.fileA, favorite.fileB]);
			
		},
		
		'l13Diff.action.favorite.openContainingFolder': ({ favorite }:FavoriteTreeItem) => {
			
			favoritesDialog.reveal([favorite.fileA, favorite.fileB]);
			
		},
		
		'l13Diff.action.favorite.openInTerminal': ({ favorite }:FavoriteTreeItem) => {
			
			favoritesDialog.openInTerminal([favorite.fileA, favorite.fileB]);
			
		},
		
		'l13Diff.action.favorite.rename': ({ favorite }:FavoriteTreeItem) => favoritesDialog.rename(favorite),
		'l13Diff.action.favorite.remove': ({ favorite }:FavoriteTreeItem) => favoritesDialog.remove(favorite),
		
		'l13Diff.action.favoriteGroups.add': () => favoriteGroupsDialog.add(),
		
		'l13Diff.action.favoriteGroups.open': ({ favoriteGroup }:FavoriteGroupTreeItem) => {
			
			openFavorites(context, favoritesState.getFavoritesByGroup(favoriteGroup), settings.get('openFavoriteAndCompare', false));
			
		},
		
		'l13Diff.action.favoriteGroups.openOnly': ({ favoriteGroup }:FavoriteGroupTreeItem) => {
			
			openFavorites(context, favoritesState.getFavoritesByGroup(favoriteGroup), false);
			
		},
		
		'l13Diff.action.favoriteGroups.openAndCompare': ({ favoriteGroup }:FavoriteGroupTreeItem) => {
			
			openFavorites(context, favoritesState.getFavoritesByGroup(favoriteGroup), true);
			
		},
		
		'l13Diff.action.favorite.addToGroup': ({ favorite }:FavoriteTreeItem) => favoriteGroupsDialog.addFavoriteToGroup(favorite),
		'l13Diff.action.favorite.removeFromGroup': ({ favorite }:FavoriteTreeItem) => favoritesState.removeFavoriteFromGroup(favorite),
		
		'l13Diff.action.favorite.copyLeftPath': ({ favorite }:FavoriteTreeItem) => vscode.env.clipboard.writeText(favorite.fileA),
		'l13Diff.action.favorite.copyRightPath': ({ favorite }:FavoriteTreeItem) => vscode.env.clipboard.writeText(favorite.fileB),
		
		'l13Diff.action.favoriteGroups.rename': ({ favoriteGroup }:FavoriteGroupTreeItem) => favoriteGroupsDialog.rename(favoriteGroup),
		'l13Diff.action.favoriteGroups.remove': ({ favoriteGroup }:FavoriteGroupTreeItem) => favoriteGroupsDialog.remove(favoriteGroup),
		
		'l13Diff.action.favorites.clear': () => favoritesDialog.clear(),
		
	});
	
}

//	Functions __________________________________________________________________

function openFavorite (context:vscode.ExtensionContext, favorite:Favorite, compare:boolean) {
	
	DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
	
}

async function openFavorites (context:vscode.ExtensionContext, favorites:Favorite[], compare:boolean) {
	
	for (const favorite of favorites) {
		await DiffPanel.create(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
	}
	
}