//	Imports ____________________________________________________________________

import { msg } from '../common';

import { L13DiffListComponent } from '../components/l13-diff-list/l13-diff-list.component';
import { L13DiffSearchComponent } from '../components/l13-diff-search/l13-diff-search.component';
import { L13DiffSearchViewModel } from '../components/l13-diff-search/l13-diff-search.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (search:L13DiffSearchComponent, searchVM:L13DiffSearchViewModel, list:L13DiffListComponent, widgets:HTMLElement) {
	
	msg.on('l13Diff.action.search.open', async () => {
		
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

