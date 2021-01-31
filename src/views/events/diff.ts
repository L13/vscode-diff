//	Imports ____________________________________________________________________

import { DiffInitViewMessage, DiffUpdatePathsMessage } from '../../types';

import { msg } from '../components/common';

import { L13DiffInputViewModel } from '../components/l13-diff-input/l13-diff-input.viewmodel';

import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, leftVM:L13DiffInputViewModel, rightVM:L13DiffInputViewModel) {
	
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

