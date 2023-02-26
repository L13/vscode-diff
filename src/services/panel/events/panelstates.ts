//	Imports ____________________________________________________________________

import type { DiffPanelStateMessage } from '../../../types';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('save:panelstate', (data: DiffPanelStateMessage) => {
		
		currentDiffPanel.savePanelState(data);
		
	});
	
}

//	Functions __________________________________________________________________

