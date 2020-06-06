//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffOutput } from '../services/DiffOutput';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.showOutput', () => DiffOutput.createOutput().show()));
	
}

//	Functions __________________________________________________________________

