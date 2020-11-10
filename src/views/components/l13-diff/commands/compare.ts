//	Imports ____________________________________________________________________

import { msg } from '../../common';

import { L13DiffInputComponent } from '../../l13-diff-input/l13-diff-input.component';
import { L13DiffSearchComponent } from '../../l13-diff-search/l13-diff-search.component';

import { L13DiffComponent } from '../l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, left:L13DiffInputComponent, right:L13DiffInputComponent, search:L13DiffSearchComponent) {
	
	msg.on('l13Diff.action.compare', () => {
		
		if (!left.focused && !right.focused && !search.focused) diff.initCompare();
		
	});
	
	msg.on('l13Diff.action.compareAll', () => {
		
		if (!left.focused && !right.focused && !search.focused) msg.send('compare:multi');
		
	});
	
}

//	Functions __________________________________________________________________

