//	Imports ____________________________________________________________________

import type { ActionsEventsInit } from '../../../../types';

import { isMetaKey } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, actions, list }: ActionsEventsInit) {
	
	actions.addEventListener('select', (event) => {
		
		const { metaKey, ctrlKey, status } = (<any>event).detail;
		
		if (status) list.selectByStatus(status, isMetaKey(ctrlKey, metaKey));
		else list.selectAll();
		
	});
	
	actions.addEventListener('copy', (event) => {
		
		const detail = (<any>event).detail;
		
		diff.disable();
		
		if (detail.altKey) list.multiCopy(detail.from);
		else list.copy(detail.from);
		
	});
	
}

//	Functions __________________________________________________________________

