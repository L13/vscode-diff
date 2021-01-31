//	Imports ____________________________________________________________________

import { DiffPanelStateMessage } from '../../types';

import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel:DiffPanel) {
	
	currentDiffPanel.msg.on('save:panelstate', (data:DiffPanelStateMessage) => currentDiffPanel.savePanelState(data));
	
}

//	Functions __________________________________________________________________

