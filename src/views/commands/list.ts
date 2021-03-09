//	Imports ____________________________________________________________________

import { msg } from '../common';

import { L13DiffListComponent } from '../components/l13-diff-list/l13-diff-list.component';
import { L13DiffSearchComponent } from '../components/l13-diff-search/l13-diff-search.component';
import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, list:L13DiffListComponent, search:L13DiffSearchComponent) {
	
	msg.on('l13Diff.action.list.delete', () => {
		
		if (list.disabled) return;
		
		diff.disable();
		list.delete();
		
	});
	
	msg.on('l13Diff.action.list.unselect', () => {
		
		if (!search.focused) list.unselect();
		
	});
	
}

//	Functions __________________________________________________________________

