//	Imports ____________________________________________________________________

import type { ListEventsInit } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, list, listVM, left, right, search, navigator, actionsVM, result, intro }:ListEventsInit) {
	
	listVM.on('cancel', () => diff.enable());
	listVM.on('compared', () => diff.enable());
	listVM.on('copied', () => diff.enable());
	listVM.on('deleted', () => diff.enable());
	
	listVM.on('multicopy', () => diff.disable());
	
	listVM.on('updated', () => list.update());
	listVM.on('removed', () => list.update());
	
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
	
	let isScrolling = false;
	
	navigator.addEventListener('mousedownscroll', () => isScrolling = true);
	navigator.addEventListener('mouseupscroll', () => isScrolling = false);
	
	list.addEventListener('scroll', (event) => {
		
		if (!isScrolling) diff.setScrollbarPosition();
		list.showVisibleListViewItems();
		
		event.stopImmediatePropagation();
		event.preventDefault();
		
	});
	
	list.addEventListener('wheel', (event) => {
		
		if (!isScrolling) diff.setScrollbarPosition();
		list.showVisibleListViewItems();
		
		event.stopImmediatePropagation();
		
	});
	
	list.addEventListener('filtered', () => diff.updateNavigator(true, false));
	
	document.addEventListener('mouseup', ({ target }) => {
		
		if (list.disabled) return;
		
		if (target === document.body || target === document.documentElement) list.unselect();
		
	});
	
	window.addEventListener('focus', () => {
		
		if (list.content.firstElementChild && !left.focused && !right.focused && !search.focused) {
			setTimeout(() => {
				
				if (!left.focused && !right.focused && !search.focused) list.focus();
				
			}, 0);
		}
		
	});
	
}

//	Functions __________________________________________________________________

