//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { register } from '../common/commands';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	let folderUri:vscode.Uri = null;
	
	register(context, {
		
		'l13Diff.selectForCompare': (uri:vscode.Uri) => {
			
			if (!folderUri) vscode.commands.executeCommand('setContext', 'l13DiffSelectedFolder', true);
			
			folderUri = uri;
			
		},
		
		'l13Diff.compareWithSelected': (uri:vscode.Uri) => {
			
			vscode.commands.executeCommand('l13Diff.openAndCompare', folderUri, uri);
			
		},
		
		'l13Diff.compareSelected': (uri:vscode.Uri, uris:vscode.Uri[]) => {
			
			vscode.commands.executeCommand('l13Diff.openAndCompare', uris[0], uris[1]);
			
		},
		
		'l13Diff.selectProjectForCompare': ({ project }) => {
			
			if (!folderUri) vscode.commands.executeCommand('setContext', 'l13DiffSelectedFolder', true);
			
			folderUri = vscode.Uri.file(project.path);
			
		},
		
		'l13Diff.compareProjectWithSelected': ({ project }) => {
			
			vscode.commands.executeCommand('l13Diff.openAndCompare', folderUri, vscode.Uri.file(project.path));
			
		},
		
	});
	
}

//	Functions __________________________________________________________________

