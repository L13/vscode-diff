//	Imports ____________________________________________________________________

import * as dialogs from '../../common/dialogs';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('dialog:file', async () => {
		
		const fsPath = await dialogs.openFile();
		
		currentDiffPanel.msg.send('dialog:file', { fsPath });
		
	});
	
	currentDiffPanel.msg.on('dialog:folder', async () => {
		
		const fsPath = await dialogs.openFolder();
		
		currentDiffPanel.msg.send('dialog:folder', { fsPath });
		
	});
	
}

//	Functions __________________________________________________________________

