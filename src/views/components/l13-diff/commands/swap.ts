//	Imports ____________________________________________________________________

import { msg } from '../../common';

import { L13DiffComponent } from '../l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent) {
	
	msg.on('l13Diff.action.swap', () => diff.swapInputs());
	
	msg.on('l13Diff.action.swapAll', () => diff.swapInputs(true));
	
}

//	Functions __________________________________________________________________

