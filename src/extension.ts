//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffFavoritesProvider, Favorite } from './services/DiffFavorites';
import { DiffMenu } from './services/DiffMenu';
import { DiffPanel } from './services/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const diffFavoritesProvider = new DiffFavoritesProvider(context);
	
	vscode.window.registerTreeDataProvider('diffExplorerFavorites', diffFavoritesProvider);
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavorite', (favorite:Favorite) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }]);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.show', () => {
		
		DiffPanel.createOrShow(context);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.clearHistory', () => {
		
		DiffMenu.clearHistory(context);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.open', (...uris:any[]) => {
		
		if (!uris.length) {
			vscode.window.showOpenDialog({
				canSelectFiles: true,
				canSelectFolders: true,
				canSelectMany: true,
			}).then((dialogUris) => {
				
				if (dialogUris) DiffPanel.createOrShow(context, dialogUris.slice(0, 2));
				
			});
		} else DiffPanel.createOrShow(context, uris[1].slice(0, 2));
		
	}));
	
	if (vscode.window.registerWebviewPanelSerializer) {
		
		vscode.window.registerWebviewPanelSerializer(DiffPanel.viewType, {
			
			async deserializeWebviewPanel (webviewPanel:vscode.WebviewPanel) {
				
				DiffPanel.revive(webviewPanel, context);
				
			},
			
		});
	}
	
}

export function deactivate () {
	
	//
	
}

//	Functions __________________________________________________________________

