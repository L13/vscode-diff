//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffFavorites } from './services/DiffFavorites';
import { DiffMenu } from './services/DiffMenu';
import { DiffOutput } from './services/DiffOutput';
import { DiffPanel } from './services/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const diffFavoritesProvider = DiffFavorites.createProvider(context);
	
	vscode.window.registerTreeDataProvider('l13DiffFavorites', diffFavoritesProvider);
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavorite', ({ favorite }) => {
		
		const compare = vscode.workspace.getConfiguration('l13Diff').get('openFavoriteAndCompare', false);
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], compare);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavoriteOnly', ({ favorite }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], false);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openFavoriteAndCompare', ({ favorite }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: favorite.fileA }, { fsPath: favorite.fileB }], true);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.compareProjectWithWorkspace', ({ project }) => {
		
		const compare = vscode.workspace.getConfiguration('l13Diff').get('openFavoriteAndCompare', false);
		const workspaces = workspaceFoldersQuickPickItems();
		
		if (workspaces.length > 1) {
			vscode.window.showQuickPick(workspaces).then((value:any) => {
				
				if (value) DiffPanel.createOrShow(context, [{ fsPath: value.description }, { fsPath: project.path }], compare);
				
			});
		} else if (workspaces.length === 1) {
			DiffPanel.createOrShow(context, [{ fsPath: workspaces[0].description }, { fsPath: project.path }], compare);
		} else vscode.window.showErrorMessage('No workspace available!');
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openProject', ({ project }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: project.path }, { fsPath: '' }]);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.addToFavorites', () => {
	
		if (DiffPanel.currentPanel) DiffPanel.addToFavorites();
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.renameFavorite', ({ favorite }) => DiffFavorites.renameFavorite(context, favorite)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.removeFavorite', ({ favorite }) => DiffFavorites.removeFavorite(context, favorite)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.clearFavorites', () => DiffFavorites.clearFavorites(context)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.showOutput', () => DiffOutput.createOutput().show()));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.show', () => DiffPanel.createOrShow(context)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.clearHistory', () => DiffMenu.clearHistory(context)));
	
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

function workspaceFoldersQuickPickItems () :any {
	
	const workspaceFolders = vscode.workspace.workspaceFolders;
	
	return workspaceFolders ? workspaceFolders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath })) : [];
	
}