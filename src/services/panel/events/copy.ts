//	Imports ____________________________________________________________________

import type { DiffCopyMessage, DiffMultiCopyMessage } from '../../../types';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('copy:left', (data: DiffCopyMessage) => {
		
		currentDiffPanel.copy.showCopyFromToDialog(data, 'A', 'B');
		
	});
	
	currentDiffPanel.msg.on('copy:right', (data: DiffCopyMessage) => {
		
		currentDiffPanel.copy.showCopyFromToDialog(data, 'B', 'A');
		
	});
	
	currentDiffPanel.msg.on('multi-copy:left', (data: DiffMultiCopyMessage) => {
		
		currentDiffPanel.copy.showMultiCopyFromToDialog(data, 'left');
		
	});
	
	currentDiffPanel.msg.on('multi-copy:right', (data: DiffMultiCopyMessage) => {
		
		currentDiffPanel.copy.showMultiCopyFromToDialog(data, 'right');
		
	});
	
	currentDiffPanel.copy.onDidCancel(() => {
		
		currentDiffPanel.msg.send('cancel');
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.copy.onDidCopyFile(({ from, to }) => {
		
		currentDiffPanel.output.log(`Copied ${from.type} "${from.name}" from "${from.root}" to "${to.root}"`);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.copy.onDidCopyFiles(({ data, from }) => {
		
		currentDiffPanel.msg.send(from === 'A' ? 'copy:left' : 'copy:right', data);
		
		if (data.multi) currentDiffPanel.sendOthers('update:multi', data);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.copy.onInitMultiCopy(({ data, from }) => {
		
		currentDiffPanel.sendAll(`multi-copy:${from}`, data);
		
	}, null, currentDiffPanel.disposables);
	
}

//	Functions __________________________________________________________________

