//	Imports ____________________________________________________________________

import { isMetaKey } from '../components/common';

import { L13DiffActionsComponent } from '../components/l13-diff-actions/l13-diff-actions.component';
import { L13DiffListComponent } from '../components/l13-diff-list/l13-diff-list.component';

import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, actions:L13DiffActionsComponent, list:L13DiffListComponent) {
	
	actions.addEventListener('select', (event) => {
			
		const { metaKey, ctrlKey, status } = (<any>event).detail;
		
		if (status) list.selectByStatus(status, isMetaKey(ctrlKey, metaKey));
		else list.selectAll();
		
	});
	
	actions.addEventListener('copy', (event) => {
		
		const detail = (<any>event).detail;
		
		diff.disable();
		
		if (detail.altKey) list.multiCopy(detail.from);
		else list.copy(detail.from);
		
	});
	
}

//	Functions __________________________________________________________________

