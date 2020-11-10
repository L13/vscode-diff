//	Imports ____________________________________________________________________

import { msg } from '../../common';

import { L13DiffInputViewModel } from '../../l13-diff-input/l13-diff-input.viewmodel';

import { L13DiffComponent } from '../l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, leftVM:L13DiffInputViewModel, rightVM:L13DiffInputViewModel) {
	
	msg.on('cancel', () => diff.enable());
	
	msg.on('focus', () => setTimeout(() => window.focus(), 0)); // Fixes losing focus if other tab has been closed
	
	msg.on('update:paths', (data) => {
		
		if (data.uris.length) {
			leftVM.value = (data.uris[0] || 0).fsPath || '';
			rightVM.value = (data.uris[1] || 0).fsPath || '';
			if (data.compare) diff.initCompare();
		}
		
	});
	
	msg.on('init:view', (data) => {
		
		msg.removeMessageListener('init:view');
		
		diff.initPanelStates(data.panel);
		
		if (data.uris.length) {
			leftVM.value = (data.uris[0] || 0).fsPath || '';
			rightVM.value = (data.uris[1] || 0).fsPath || '';
		} else {
			leftVM.value = data.workspaces[0] || '';
			rightVM.value = data.workspaces[1] || '';
		}
		
		if (data.compare) diff.initCompare();
		
	});
	
	msg.send('init:view');
	
}

//	Functions __________________________________________________________________
