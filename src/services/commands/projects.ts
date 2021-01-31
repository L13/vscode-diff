//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';
import * as settings from '../common/settings';

import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	commands.register(context, {
		
		'l13Diff.action.projects.compareWithWorkspace': async ({ project }) => {
			
			const compare = settings.get('openFavoriteAndCompare', false);
			const workspaces = workspaceFoldersQuickPickItems();
			
			if (workspaces.length > 1) {
				const value:any = await vscode.window.showQuickPick(workspaces);
				if (value) DiffPanel.createOrShow(context, [{ fsPath: value.description }, { fsPath: project.path }], compare);
			} else if (workspaces.length === 1) {
				DiffPanel.createOrShow(context, [{ fsPath: workspaces[0].description }, { fsPath: project.path }], compare);
			} else vscode.window.showErrorMessage('No workspace available!');
			
		},
		
		'l13Diff.action.projects.open': ({ project }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: project.path }, { fsPath: '' }]);
			
		},
		
	});
	
}

//	Functions __________________________________________________________________

function workspaceFoldersQuickPickItems () :any {
	
	const workspaceFolders = vscode.workspace.workspaceFolders;
	
	return workspaceFolders ? workspaceFolders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath })) : [];
	
}