//	Imports ____________________________________________________________________

import { msg } from '../components/common';

import { L13DiffViewsViewModel } from '../components/l13-diff-views/l13-diff-views.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (viewsVM:L13DiffViewsViewModel) {
	
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

