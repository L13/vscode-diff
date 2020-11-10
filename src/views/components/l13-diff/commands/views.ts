//	Imports ____________________________________________________________________

import { msg } from '../../common';

import { L13DiffViewsViewModel } from '../../l13-diff-views/l13-diff-views.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (viewsVM:L13DiffViewsViewModel) {
	
	msg.on('l13Diff.action.views.toggleShowAllCreated', () => {
			
		viewsVM.untrackedChecked = !viewsVM.untrackedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllDeleted', () => {
		
		viewsVM.untrackedChecked = !viewsVM.untrackedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllIgnored', () => {
		
		viewsVM.untrackedChecked = !viewsVM.untrackedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllModified', () => {
		
		viewsVM.untrackedChecked = !viewsVM.untrackedChecked;
		viewsVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.views.toggleShowAllUnchanged', () => {
		
		viewsVM.untrackedChecked = !viewsVM.untrackedChecked;
		viewsVM.requestUpdate();
		
	});
	
}

//	Functions __________________________________________________________________

