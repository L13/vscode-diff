//	Imports ____________________________________________________________________

import type { SearchCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ search, searchVM, widgets }: SearchCommandsInit) {
	
	msg.on('l13Diff.action.search.open', () => {
		
		if (!search.parentNode) {
			search.classList.add('-movein');
			widgets.appendChild(search);
		} else search.focus();
		
	});
	
	msg.on('l13Diff.action.search.close', () => search.close());
	
	msg.on('l13Diff.action.search.toggleFindCaseSensitive', () => {
		
		searchVM.useCaseSensitive = !searchVM.useCaseSensitive;
		searchVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.search.toggleFindRegularExpression', () => {
		
		searchVM.useRegExp = !searchVM.useRegExp;
		searchVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.search.toggleFindFiles', () => {
		
		searchVM.useFiles = !searchVM.useFiles;
		searchVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.search.toggleFindFolders', () => {
		
		searchVM.useFolders = !searchVM.useFolders;
		searchVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.search.toggleFindSymbolicLinks', () => {
		
		searchVM.useSymlinks = !searchVM.useSymlinks;
		searchVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.search.toggleFindConflicts', () => {
		
		searchVM.useConflicts = !searchVM.useConflicts;
		searchVM.requestUpdate();
		
	});
	
	msg.on('l13Diff.action.search.toggleFindOthers', () => {
		
		searchVM.useOthers = !searchVM.useOthers;
		searchVM.requestUpdate();
		
	});
	
}

//	Functions __________________________________________________________________

