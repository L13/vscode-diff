//	Imports ____________________________________________________________________

import type { ListEventsInit } from '../../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, list, listVM, navigator, actionsVM, result, intro }: ListEventsInit) {
	
	listVM.on('cancel', () => diff.enable());
	listVM.on('compared', () => diff.enable());
	listVM.on('copied', () => diff.enable());
	listVM.on('deleted', () => diff.enable());
	
	listVM.on('multicopy', () => diff.disable());
	
	listVM.on('filtered', () => {
		
		result.style.display = listVM.items.length && !listVM.filteredItems.length ? 'block' : 'none';
		intro.style.display = listVM.items.length ? 'none' : 'block';
		
	});
	
	list.addEventListener('copy', () => diff.disable());
	list.addEventListener('delete', () => diff.disable());
	
	list.addEventListener('selected', () => {
		
		actionsVM.enableCopy();
		diff.updateNavigator(false, true);
		
	});
	
	list.addEventListener('unselected', () => {
		
		actionsVM.disableCopy();
		navigator.clearSelection();
		
	});
	
	list.addEventListener('scroll', (event) => {
		
		event.stopImmediatePropagation();
		
		diff.updateScrollbarPosition();
		list.showVisibleListViewItems();
		
	});
	
	list.addEventListener('filtered', () => diff.updateNavigator(true, false));
	
}

//	Functions __________________________________________________________________

