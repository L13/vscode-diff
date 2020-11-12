//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';

import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	commands.register(context, createKeyboardShortcuts([
		'l13Diff.action.panel.addToFavoritesorites',
		'l13Diff.action.panel.compare',
		'l13Diff.action.panel.compareAll',
		
		'l13Diff.action.input.swap',
		'l13Diff.action.input.swapAll',
		
		'l13Diff.action.actions.copyToLeftFolder',
		'l13Diff.action.actions.copyToRightFolder',
		'l13Diff.action.actions.selectAllEntries',
		'l13Diff.action.actions.selectCreatedEntries',
		'l13Diff.action.actions.selectDeletedEntries',
		'l13Diff.action.actions.selectModifiedEntries',
		
		'l13Diff.action.list.delete',
		'l13Diff.action.list.unselect',
		
		'l13Diff.action.menu.close',
		
		'l13Diff.action.search.open',
		'l13Diff.action.search.close',
		'l13Diff.action.search.toggleFindCaseSensitive',
		'l13Diff.action.search.toggleFindConflicts',
		'l13Diff.action.search.toggleFindFiles',
		'l13Diff.action.search.toggleFindFolders',
		'l13Diff.action.search.toggleFindOthers',
		'l13Diff.action.search.toggleFindRegularExpression',
		'l13Diff.action.search.toggleFindSymbolicLinks',
		
		'l13Diff.action.views.toggleShowAllCreated',
		'l13Diff.action.views.toggleShowAllDeleted',
		'l13Diff.action.views.toggleShowAllIgnored',
		'l13Diff.action.views.toggleShowAllModified',
		'l13Diff.action.views.toggleShowAllUnchanged',
	]));
	
}

//	Functions __________________________________________________________________

function createKeyboardShortcuts (commands:string[]) {
	
	const map:{ [command:string]: () => void } = {};
	
	commands.forEach((command) => {
		
		map[command] = () => DiffPanel.send(command);
		
	});
	
	return map;
	
}