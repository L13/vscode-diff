//	Imports ____________________________________________________________________

import type { ViewsCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ viewsVM }: ViewsCommandsInit) {
	
	msg.on('l13Diff.action.views.toggleShowAllCreated', () => {
		
		viewsVM.untrackedChecked = !viewsVM.untrackedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllDeleted', () => {
		
		viewsVM.deletedChecked = !viewsVM.deletedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllIgnored', () => {
		
		viewsVM.ignoredChecked = !viewsVM.ignoredChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllModified', () => {
		
		viewsVM.modifiedChecked = !viewsVM.modifiedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllUnchanged', () => {
		
		viewsVM.unchangedChecked = !viewsVM.unchangedChecked;
		viewsVM.requestUpdate();
		
	});
	
}

//	Functions __________________________________________________________________

