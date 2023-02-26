//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Comparison } from '../../types';

import * as commands from '../common/commands';
import * as settings from '../common/settings';

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

export function activate (context: vscode.ExtensionContext) {
	
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
		
		'l13Diff.action.history.compare': ({ comparison }: HistoryTreeItem) => openComparison(context, comparison, settings.openInNewPanel(), historyState),
		'l13Diff.action.history.compareInCurrentPanel': ({ comparison }: HistoryTreeItem) => openComparison(context, comparison, false, historyState),
		'l13Diff.action.history.compareInNewPanel': ({ comparison }: HistoryTreeItem) => openComparison(context, comparison, true, historyState),
		
		'l13Diff.action.history.addToFavorites': ({ comparison }: HistoryTreeItem) => {
			
			favoritesDialog.add(comparison.fileA, comparison.fileB);
			
		},
		
		'l13Diff.action.history.copyLeftPath': ({ comparison }: HistoryTreeItem) => vscode.env.clipboard.writeText(comparison.fileA),
		'l13Diff.action.history.copyRightPath': ({ comparison }: HistoryTreeItem) => vscode.env.clipboard.writeText(comparison.fileB),
		
		'l13Diff.action.history.remove': ({ comparison }: HistoryTreeItem) => historyDialog.remove(comparison),
		
		'l13Diff.action.history.clear': async () => historyDialog.clear(),
		
	});
	
}

//	Functions __________________________________________________________________

function openComparison (context: vscode.ExtensionContext, comparison: Comparison, openInNewPanel: boolean, historyState: HistoryState) {
	
	if (comparison.type === 'file') {
		const left = vscode.Uri.file(comparison.fileA);
		const right = vscode.Uri.file(comparison.fileB);
		const openToSide = settings.get('openToSide', false);
		vscode.commands.executeCommand('vscode.diff', left, right, undefined, {
			preview: false,
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		});
		historyState.add(comparison.fileA, comparison.fileB, 'file');
		return;
	}
	
	if (openInNewPanel) DiffPanel.create(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
	else DiffPanel.createOrShow(context, [{ fsPath: comparison.fileA }, { fsPath: comparison.fileB }], true);
	
}