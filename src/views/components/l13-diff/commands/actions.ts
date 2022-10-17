//	Imports ____________________________________________________________________

import type { ActionsCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ list }: ActionsCommandsInit) {
	
	msg.on('l13Diff.action.actions.copyToLeftFolder', () => list.copy('right'));
	msg.on('l13Diff.action.actions.copyToRightFolder', () => list.copy('left'));
	
	msg.on('l13Diff.action.actions.selectAllEntries', () => {
		
		list.selectAll();
		list.focus();
		
	});
	
	msg.on('l13Diff.action.actions.selectCreatedEntries', () => list.selectByStatus('untracked'));
	msg.on('l13Diff.action.actions.selectDeletedEntries', () => list.selectByStatus('deleted'));
	msg.on('l13Diff.action.actions.selectModifiedEntries', () => list.selectByStatus('modified'));
	
}

//	Functions __________________________________________________________________

