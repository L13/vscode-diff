//	Imports ____________________________________________________________________

import { msg } from '../components/common';

import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent) {
	
	msg.on('l13Diff.action.input.swap', () => diff.swapInputs());
	
	msg.on('l13Diff.action.input.swapAll', () => diff.swapInputs(true));
	
}

//	Functions __________________________________________________________________

