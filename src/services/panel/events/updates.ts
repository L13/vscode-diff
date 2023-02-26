//	Imports ____________________________________________________________________

import type { Diff, DiffResultMessage } from '../../../types';

import type { DiffResult } from '../../output/DiffResult';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	currentDiffPanel.msg.on('update:diffs', (data: DiffResultMessage) => {
		
		currentDiffPanel.compare.updateDiffs(data);
		
	});
	
	currentDiffPanel.compare.onDidUpdateDiff((diff: Diff) => {
		
		currentDiffPanel.output.log(`Compared "${formatPath(diff)}" again. Status is now "${diff.status}"`);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.compare.onDidUpdateAllDiffs((diffResult: DiffResult) => {
		
		currentDiffPanel.msg.send('update:diffs', diffResult);
		
	}, null, currentDiffPanel.disposables);
	
}

//	Functions __________________________________________________________________

function formatPath (diff: Diff) {
	
	const relativeA = diff.fileA.relative;
	const relativeB = diff.fileB.relative;
	
	return relativeA === relativeB ? relativeA : `${relativeA}" and "${relativeB}`;
	
}