//	Imports ____________________________________________________________________

import type { ListCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, list, search }: ListCommandsInit) {
	
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

