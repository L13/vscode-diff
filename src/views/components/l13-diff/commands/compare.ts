//	Imports ____________________________________________________________________

import type { CompareCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, left, right, search }: CompareCommandsInit) {
	
	msg.on('l13Diff.action.panel.compare', () => {
		
		if (!left.focused && !right.focused && !search.focused) diff.initCompare();
		
	});
	
	msg.on('l13Diff.action.panel.compareAll', () => {
		
		if (!left.focused && !right.focused && !search.focused) msg.send('compare:multi');
		
	});
	
}

//	Functions __________________________________________________________________

