//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Comparison } from '../../types';

import * as commands from '../common/commands';

import { FavoritesDialog } from '../dialogs/FavoritesDialog';
import { HistoryDialog } from '../dialogs/HistoryDialog';

import { DiffPanel } from '../panel/DiffPanel';

import { HistoryProvider } from '../sidebar/HistoryProvider';
import { HistoryTreeItem } from '../sidebar/trees/HistoryTreeItem';

import { FavoritesState } from '../states/FavoritesState';
import { HistoryState } from '../states/HistoryState';
import { MenuState } from '../states/MenuState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	const subscriptions = context.subscriptions;
	
	const favoritesState = FavoritesState.create(context);
	const historyState = HistoryState.create(context);
	const menuState = MenuState.create(context);
	
	const favoritesDialog = FavoritesDialog.create(favoritesState);
	const historyDialog = HistoryDialog.create(historyState, menuState);
	
	const historyProvider = HistoryProvider.create({
		comparisons: historyState.get(),
	});
	
	vscode.window.registerTreeDataProvider('l13DiffHistory', historyProvider);
	
	subscriptions.push(historyState.onDidChangeComparisons((comparisons) => {
		
		historyProvider.refresh({
			comparisons,
		});
		
	}));
	
	commands.register(context, {
		
		'l13Diff.action.history.open': ({ comparison }:HistoryTreeItem) => openComparison(context, comparison, true),
		'l13Diff.action.history.openOnly': ({ comparison }:HistoryTreeItem) => openComparison(context, comparison, false),
		'l13Diff.action.history.openAndCompare': ({ comparison }:HistoryTreeItem) => openComparison(context, comparison, true),
		'l13Diff.action.history.openInNewPanel': ({ comparison }:HistoryTreeItem) => {
			
			DiffPanel.create(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
			
		},
		
		'l13Diff.action.history.addToFavorites': ({ comparison }:HistoryTreeItem) => {
			
			favoritesDialog.add(comparison.fileA, comparison.fileB);
			
		},
		
		'l13Diff.action.history.copyLeftPath': ({ comparison }:HistoryTreeItem) => vscode.env.clipboard.writeText(comparison.fileA),
		'l13Diff.action.history.copyRightPath': ({ comparison }:HistoryTreeItem) => vscode.env.clipboard.writeText(comparison.fileB),
		
		'l13Diff.action.history.remove': ({ comparison }:HistoryTreeItem) => historyDialog.remove(comparison),
		
		'l13Diff.action.history.clear': async () => historyDialog.clear(),
		
	});
	
}

//	Functions __________________________________________________________________

function openComparison (context:vscode.ExtensionContext, comparison:Comparison, compare:boolean) {
	
	DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], compare);
	
}