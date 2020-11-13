//	Imports ____________________________________________________________________

import { msg } from '../components/common';

import { L13DiffInputViewModel } from '../components/l13-diff-input/l13-diff-input.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (leftVM:L13DiffInputViewModel, rightVM:L13DiffInputViewModel) {
	
	msg.on('l13Diff.action.input.pickLeftFolder', () => leftVM.pick());
	
	msg.on('l13Diff.action.input.pickLeftFile', () => leftVM.pick(true));
	
	msg.on('l13Diff.action.input.pickRightFolder', () => rightVM.pick());
	
	msg.on('l13Diff.action.input.pickRightFile', () => rightVM.pick(true));
	
}

//	Functions __________________________________________________________________

