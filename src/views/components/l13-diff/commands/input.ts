//	Imports ____________________________________________________________________

import type { InputCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ leftVM, rightVM }: InputCommandsInit) {
	
	msg.on('l13Diff.action.input.pickLeftFolder', () => leftVM.pick());
	
	msg.on('l13Diff.action.input.pickLeftFile', () => leftVM.pick(true));
	
	msg.on('l13Diff.action.input.pickRightFolder', () => rightVM.pick());
	
	msg.on('l13Diff.action.input.pickRightFile', () => rightVM.pick(true));
	
}

//	Functions __________________________________________________________________

