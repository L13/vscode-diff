//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { ProjectTreeItem } from '../../types';

import * as commands from '../common/commands';

import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	commands.register(context, {
		
		'l13Diff.action.projects.compareWithWorkspace': async ({ project }: ProjectTreeItem) => {
			
			const workspaces = workspaceFoldersQuickPickItems();
			
			if (workspaces.length > 1) {
				const value = await vscode.window.showQuickPick(workspaces);
				if (value) DiffPanel.createOrShow(context, [{ fsPath: value.description }, { fsPath: project.path }], true);
			} else if (workspaces.length === 1) {
				DiffPanel.createOrShow(context, [{ fsPath: workspaces[0].description }, { fsPath: project.path }], true);
			} else vscode.window.showErrorMessage('No workspace available!');
			
		},
		
		'l13Diff.action.projects.open': ({ project }: ProjectTreeItem) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: project.path }, { fsPath: '' }]);
			
		},
		
	});
	
}

//	Functions __________________________________________________________________

function workspaceFoldersQuickPickItems (): Array<{ label: string, description: string }> {
	
	const workspaceFolders = vscode.workspace.workspaceFolders;
	
	return workspaceFolders ? workspaceFolders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath })) : [];
	
}