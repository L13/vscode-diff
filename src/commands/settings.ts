//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffSettings } from '../services/common/DiffSettings';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.compareWhitespace', () => {
		
		const useDefault = DiffSettings.get('ignoreTrimWhitespace', 'default');
		
		if (useDefault === 'default') vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', false, true);
		else DiffSettings.update('ignoreTrimWhitespace', 'off');
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.ignoreWhitespace', () => {
		
		const useDefault = DiffSettings.get('ignoreTrimWhitespace', 'default');
		
		if (useDefault === 'default') vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', true, true);
		else DiffSettings.update('ignoreTrimWhitespace', 'on');
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.compareEndOfLine', () => {
		
		DiffSettings.update('ignoreEndOfLine', false);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.ignoreEndOfLine', () => {
		
		DiffSettings.update('ignoreEndOfLine', true);
		
	}));
	
}

//	Functions __________________________________________________________________

