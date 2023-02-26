//	Imports ____________________________________________________________________

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('context', ({ name, value }) => {
		
		currentDiffPanel.setContext(name, value);
		
	});
	
}

//	Functions __________________________________________________________________

