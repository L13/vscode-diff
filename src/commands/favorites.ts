//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffFavorites } from '../services/DiffFavorites';
import { DiffPanel } from '../services/DiffPanel';
import { DiffSettings } from '../services/DiffSettings';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const diffFavoritesProvider = DiffFavorites.createProvider(context);
	
	vscode.window.registerTreeDataProvider('l13DiffFavorites', diffFavoritesProvider);
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavorite', ({ favorite }) => {
		
		const compare = DiffSettings.get('openFavoriteAndCompare', false);
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavoriteOnly', ({ favorite }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], false);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavoriteAndCompare', ({ favorite }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.addToFavorites', () => DiffPanel.addToFavorites()));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.renameFavorite', ({ favorite }) => DiffFavorites.renameFavorite(context, favorite)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.removeFavorite', ({ favorite }) => DiffFavorites.removeFavorite(context, favorite)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.clearFavorites', () => DiffFavorites.clearFavorites(context)));
	
}

//	Functions __________________________________________________________________

