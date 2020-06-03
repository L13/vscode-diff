//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffHistory } from '../services/DiffHistory';
import { DiffMenu } from '../services/DiffMenu';
import { DiffPanel } from '../services/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const diffHistoryProvider = DiffHistory.createProvider(context);
	
	vscode.window.registerTreeDataProvider('l13DiffHistory', diffHistoryProvider);
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openComparison', ({ comparison }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openComparisonOnly', ({ comparison }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], false);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openComparisonAndCompare', ({ comparison }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.removeComparison', ({ comparison }) => DiffHistory.removeComparison(context, comparison)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.clearHistory', () => {
		
		vscode.window.showInformationMessage('Delete the complete history?', { modal: true }, 'Delete').then((value) => {
			
			if (value) {
				DiffMenu.clearHistory(context);
				DiffHistory.clearComparisons(context);
			}
			
		});
		
	}));
	
}

//	Functions __________________________________________________________________
