//	Imports ____________________________________________________________________

import type { DiffGoToMessage, DiffOpenMessage, DiffPreviewMessage } from '../../../types';

import { DiffOpen } from '../../actions/DiffOpen';

import * as files from '../../common/files';
import * as settings from '../../common/settings';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('open:diff', async ({ diffs, openToSide }: DiffOpenMessage) => {
			
		openToSide = settings.get('openToSide', false) || openToSide;
		
		for (let i = 0; i < diffs.length; i++) await DiffOpen.open(diffs[i], i === 0 && openToSide);
		
	});
	
	currentDiffPanel.msg.on('preview:diff', async ({ diff }: DiffPreviewMessage) => {
			
		await DiffOpen.open(diff, true, true);
		
	});
	
	currentDiffPanel.msg.on('goto:file', async ({ files: diffFiles, openToSide }: DiffGoToMessage) => {
		
		openToSide = settings.get('openToSide', false) || openToSide;
		
		for (let i = 0; i < diffFiles.length; i++) await DiffOpen.openFile(diffFiles[i], i === 0 && openToSide, false);
		
	});
	
	currentDiffPanel.msg.on('reveal:file', (fsPath: string) => files.reveal(fsPath));
	
}

//	Functions __________________________________________________________________

