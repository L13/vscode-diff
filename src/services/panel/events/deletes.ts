//	Imports ____________________________________________________________________

import type { DiffFile } from '../../../types';

import type { DiffResult } from '../../output/DiffResult';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('delete:both', (data: DiffResult) => {
		
		currentDiffPanel.delete.showDeleteFilesDialog(data);
		
	});
	
	currentDiffPanel.msg.on('delete:left', (data: DiffResult) => {
		
		currentDiffPanel.delete.showDeleteFileDialog(data, 'left');
		
	});
	
	currentDiffPanel.msg.on('delete:right', (data: DiffResult) => {
		
		currentDiffPanel.delete.showDeleteFileDialog(data, 'right');
		
	});
	
	currentDiffPanel.delete.onDidCancel(() => {
		
		currentDiffPanel.msg.send('cancel');
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.delete.onDidDeleteFile((file: DiffFile) => {
		
		currentDiffPanel.output.log(`Deleted ${file.type} "${file.path}"`);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.delete.onDidDeleteFiles((data: DiffResult) => {
		
		currentDiffPanel.msg.send('delete:files', data);
		currentDiffPanel.sendOthers('update:multi', data);
		
	}, null, currentDiffPanel.disposables);
	
}

//	Functions __________________________________________________________________

