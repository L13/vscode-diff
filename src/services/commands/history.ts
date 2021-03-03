//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';
import * as dialogs from '../common/dialogs';

import { DiffPanel } from '../panel/DiffPanel';

import { HistoryProvider } from '../sidebar/HistoryProvider';

import { HistoryState } from '../states/HistoryState';
import { MenuState } from '../states/MenuState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	
	const historyState = HistoryState.createHistoryState(context);
	const menuState = MenuState.createMenuState(context);
	
	const historyProvider = HistoryProvider.createProvider({
		comparisons: historyState.getComparisons(),
	});
	
	vscode.window.registerTreeDataProvider('l13DiffHistory', historyProvider);
	
	subscriptions.push(vscode.window.onDidChangeWindowState(({ focused }) => {
		
		if (focused) { // Update data if changes in another workspace have been done
			historyProvider.refresh({
				comparisons: historyState.getComparisons(),
			});
		}
		
	}));
	
	subscriptions.push(historyState.onDidChangeComparisons((comparisons) => {
		
		historyProvider.refresh({
			comparisons,
		});
		
	}));
	
	subscriptions.push(historyState.onDidDeleteComparison(() => {
		
		historyProvider.refresh({
			comparisons: historyState.getComparisons(),
		});
		
	}));
	
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
		
		'l13Diff.action.history.remove': ({ comparison }) => historyState.removeComparison(comparison),
		
		'l13Diff.action.history.clear': async () => {
			
			if (await dialogs.confirm('Delete the complete history?', 'Delete')) {
				menuState.clearHistory();
				historyState.clearComparisons();
			}
			
		},
	});
	
}

//	Functions __________________________________________________________________

