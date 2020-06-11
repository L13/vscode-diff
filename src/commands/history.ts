//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffDialog } from '../services/common/DiffDialog';
import { DiffMenu } from '../services/panel/DiffMenu';
import { DiffPanel } from '../services/panel/DiffPanel';
import { DiffHistory } from '../services/sidebar/DiffHistory';

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
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openComparisonInNewPanel', ({ comparison }) => {
		
		DiffPanel.create(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.removeComparison', ({ comparison }) => DiffHistory.removeComparison(context, comparison)));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.clearHistory', async () => {
		
		const value = await DiffDialog.confirm('Delete the complete history?', 'Delete');
		
		if (value) {
			DiffMenu.clearHistory(context);
			DiffHistory.clearComparisons(context);
		}
		
	}));
	
}

//	Functions __________________________________________________________________

