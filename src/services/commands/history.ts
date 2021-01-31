//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';
import * as dialogs from '../common/dialogs';

import { DiffMenu } from '../panel/DiffMenu';
import { DiffPanel } from '../panel/DiffPanel';
import { DiffHistory } from '../sidebar/DiffHistory';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const diffHistoryProvider = DiffHistory.createProvider(context);
	
	vscode.window.registerTreeDataProvider('l13DiffHistory', diffHistoryProvider);
	
	commands.register(context, {
		
		'l13Diff.action.history.open': ({ comparison }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
			
		},
		
		'l13Diff.action.history.openOnly': ({ comparison }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], false);
			
		},
		
		'l13Diff.action.history.openAndCompare': ({ comparison }) => {
			
			DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
			
		},
		
		'l13Diff.action.history.openInNewPanel': ({ comparison }) => {
			
			DiffPanel.create(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
			
		},
		
		'l13Diff.action.history.remove': ({ comparison }) => DiffHistory.removeComparison(context, comparison),
		
		'l13Diff.action.history.clear': async () => {
			
			const value = await dialogs.confirm('Delete the complete history?', 'Delete');
			
			if (value) {
				DiffMenu.clearHistory(context);
				DiffHistory.clearComparisons(context);
			}
			
		},
	});
	
}

//	Functions __________________________________________________________________

