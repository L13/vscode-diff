//	Imports ____________________________________________________________________

import type { CompareEventsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, compare }: CompareEventsInit) {
	
	compare.addEventListener('compare', (event) => {
		
		if ((<any>(<MouseEvent>event).detail).altKey) msg.send('compare:multi');
		else diff.initCompare();
		
	});
	
	msg.on('compare:multi', () => diff.initCompare());
	
}

//	Functions __________________________________________________________________

