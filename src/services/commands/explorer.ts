//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { ProjectTreeItem } from '../../types';

import * as commands from '../common/commands';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	let folderUri: vscode.Uri = null;
	
	commands.register(context, {
		
		'l13Diff.action.explorer.selectForCompare': (uri: vscode.Uri) => {
			
			if (!folderUri) vscode.commands.executeCommand('setContext', 'l13DiffSelectedFolder', true);
			
			folderUri = uri;
			
		},
		
		'l13Diff.action.explorer.compareWithSelected': (uri: vscode.Uri) => {
			
			vscode.commands.executeCommand('l13Diff.action.panel.openAndCompare', folderUri, uri);
			
		},
		
		'l13Diff.action.explorer.compareSelected': (uri: vscode.Uri, uris: vscode.Uri[]) => {
			
			vscode.commands.executeCommand('l13Diff.action.panel.openAndCompare', uris[0], uris[1]);
			
		},
		
		'l13Diff.action.projects.selectForCompare': ({ project }: ProjectTreeItem) => {
			
			if (!folderUri) vscode.commands.executeCommand('setContext', 'l13DiffSelectedFolder', true);
			
			folderUri = vscode.Uri.file(project.path);
			
		},
		
		'l13Diff.action.projects.compareWithSelected': ({ project }: ProjectTreeItem) => {
			
			vscode.commands.executeCommand('l13Diff.action.panel.openAndCompare', folderUri, vscode.Uri.file(project.path));
			
		},
		
	});
	
}

//	Functions __________________________________________________________________

