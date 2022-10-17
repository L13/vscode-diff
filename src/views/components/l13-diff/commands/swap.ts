//	Imports ____________________________________________________________________

import type { SwapCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff }: SwapCommandsInit) {
	
	msg.on('l13Diff.action.inputs.swap', () => diff.swapInputs());
	
	msg.on('l13Diff.action.inputs.swapAll', () => diff.swapInputs(true));
	
}

//	Functions __________________________________________________________________

