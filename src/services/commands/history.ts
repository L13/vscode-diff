//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Comparison } from '../../types';

import * as commands from '../common/commands';

import { HistoryDialog } from '../dialogs/HistoryDialog';

import { DiffPanel } from '../panel/DiffPanel';

import { HistoryProvider } from '../sidebar/HistoryProvider';

import { HistoryState } from '../states/HistoryState';
import { MenuState } from '../states/MenuState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	
	const historyState = HistoryState.create(context);
	const menuState = MenuState.create(context);
	const historyDialog = HistoryDialog.create(historyState, menuState);
	
	const historyProvider = HistoryProvider.create({
		comparisons: historyState.get(),
	});
	
	vscode.window.registerTreeDataProvider('l13DiffHistory', historyProvider);
	
	subscriptions.push(vscode.window.onDidChangeWindowState(({ focused }) => {
		
		if (focused) { // Update data if changes in another workspace have been done
			historyProvider.refresh({
				comparisons: historyState.get(),
			});
		}
		
	}));
	
	subscriptions.push(historyState.onDidChangeComparisons((comparisons) => {
		
		historyProvider.refresh({
			comparisons,
		});
		
	}));
	
	commands.register(context, {
		
		'l13Diff.action.history.open': ({ comparison }) => {
			
			openComparison(context, comparison, true);
			
		},
		
		'l13Diff.action.history.openOnly': ({ comparison }) => {
			
			openComparison(context, comparison, false);
			
		},
		
		'l13Diff.action.history.openAndCompare': ({ comparison }) => {
			
			openComparison(context, comparison, true);
			
		},
		
		'l13Diff.action.history.openInNewPanel': ({ comparison }) => {
			
			DiffPanel.create(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
			
		},
		
		'l13Diff.action.history.remove': ({ comparison }) => historyDialog.remove(comparison),
		
		'l13Diff.action.history.clear': async () => historyDialog.clear(),
		
	});
	
}

//	Functions __________________________________________________________________

function openComparison (context:vscode.ExtensionContext, comparison:Comparison, compare:boolean) {
	
	DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], compare);
	
}