//	Imports ____________________________________________________________________

import { msg } from '../../common';

import { L13DiffListComponent } from '../../l13-diff-list/l13-diff-list.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (list:L13DiffListComponent) {
	
	msg.on('l13Diff.action.actions.copyToLeftFolder', () => list.copy('right'));
	msg.on('l13Diff.action.actions.copyToRightFolder', () => list.copy('left'));
		
	msg.on('l13Diff.action.actions.selectAllEntries', () => list.selectAll());
	msg.on('l13Diff.action.actions.selectCreatedEntries', () => list.selectByStatus('untracked'));
	msg.on('l13Diff.action.actions.selectDeletedEntries', () => list.selectByStatus('deleted'));
	msg.on('l13Diff.action.actions.selectModifiedEntries', () => list.selectByStatus('modified'));
	
}

//	Functions __________________________________________________________________

