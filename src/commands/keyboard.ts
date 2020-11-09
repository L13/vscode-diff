//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';

import { DiffPanel } from '../services/panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	commands.register(context, createKeyboardShortcuts([
		'l13Diff.panel.action.compare',
		'l13Diff.panel.action.compareAll',
		'l13Diff.panel.action.copyLeft',
		'l13Diff.panel.action.copyRight',
		'l13Diff.panel.action.delete',
		'l13Diff.panel.action.filter',
		'l13Diff.panel.action.selectCreatedEntries',
		'l13Diff.panel.action.selectDeletedEntries',
		'l13Diff.panel.action.selectModifiedEntries',
		'l13Diff.panel.action.selectAllEntries',
		'l13Diff.panel.action.swap',
		'l13Diff.panel.action.swapAll',
		'l13Diff.panel.action.toggleShowAllCreated',
		'l13Diff.panel.action.toggleShowAllDeleted',
		'l13Diff.panel.action.toggleShowAllIgnored',
		'l13Diff.panel.action.toggleShowAllModified',
		'l13Diff.panel.action.toggleShowAllUnchanged',
		'l13Diff.panel.action.unselect',
		'l13Diff.panel.menu.close',
		'l13Diff.panel.searchWidget.close',
		'l13Diff.panel.searchWidget.toggleFindCaseSensitive',
		'l13Diff.panel.searchWidget.toggleFindConflicts',
		'l13Diff.panel.searchWidget.toggleFindFiles',
		'l13Diff.panel.searchWidget.toggleFindFolders',
		'l13Diff.panel.searchWidget.toggleFindRegex',
		'l13Diff.panel.searchWidget.toggleFindSymbolicLinks',
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