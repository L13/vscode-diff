//	Imports ____________________________________________________________________

import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel:DiffPanel) {
	
	currentDiffPanel.msg.on('context', ({ name, value }) => {
		
		currentDiffPanel.setContext(name, value);
		
	});
	
}

//	Functions __________________________________________________________________

