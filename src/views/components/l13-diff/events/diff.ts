//	Imports ____________________________________________________________________

import type { DiffEventsInit, DiffInitViewMessage, DiffUpdatePathsMessage } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, leftVM, rightVM }:DiffEventsInit) {
	
	msg.on('cancel', () => diff.enable());
	
	msg.on('focus', () => setTimeout(() => window.focus(), 0)); // Fixes losing focus if other tab has been closed
	
	msg.on('update:paths', (data:DiffUpdatePathsMessage) => {
		
		if (data.uris.length) {
			leftVM.value = data.uris[0]?.fsPath || '';
			rightVM.value = data.uris[1]?.fsPath || '';
			if (data.compare) diff.initCompare();
		}
		
	});
	
	msg.on('init:view', (data:DiffInitViewMessage) => {
		
		msg.removeMessageListener('init:view');
		
		diff.initPanelStates(data.panel);
		
		if (data.uris.length) {
			leftVM.value = data.uris[0]?.fsPath || '';
			rightVM.value = data.uris[1]?.fsPath || '';
		} else {
			leftVM.value = data.workspaces[0] || '';
			rightVM.value = data.workspaces[1] || '';
		}
		
		if (data.compare) diff.initCompare();
		
	});
	
	msg.send('init:view');
	
}

//	Functions __________________________________________________________________

