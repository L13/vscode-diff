//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { SymlinkContentProvider } from '../actions/symlinks/SymlinkContentProvider';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	const contentProvider = new SymlinkContentProvider();
	
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(SymlinkContentProvider.SCHEME, contentProvider));
	
}

//	Functions __________________________________________________________________

