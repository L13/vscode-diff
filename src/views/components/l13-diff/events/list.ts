//	Imports ____________________________________________________________________

import { L13DiffActionsViewModel } from '../../l13-diff-actions/l13-diff-actions.viewmodel';
import { L13DiffInputComponent } from '../../l13-diff-input/l13-diff-input.component';
import { L13DiffListComponent } from '../../l13-diff-list/l13-diff-list.component';
import { L13DiffListViewModel } from '../../l13-diff-list/l13-diff-list.viewmodel';
import { L13DiffNavigatorComponent } from '../../l13-diff-navigator/l13-diff-navigator.component';
import { L13DiffSearchComponent } from '../../l13-diff-search/l13-diff-search.component';

import { L13DiffComponent } from '../l13-diff.component';



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (
	diff:L13DiffComponent,
	list:L13DiffListComponent,
	listVM:L13DiffListViewModel,
	left:L13DiffInputComponent,
	right:L13DiffInputComponent,
	search:L13DiffSearchComponent,
	navigator:L13DiffNavigatorComponent,
	actionsVM:L13DiffActionsViewModel,
	result:HTMLElement,
	intro:HTMLElement) {
	
	listVM.on('cancel', () => diff.enable());
	listVM.on('compared', () => diff.enable());
	listVM.on('copied', () => diff.enable());
	listVM.on('deleted', () => diff.enable());
	listVM.on('updated', () => diff.enable());
	listVM.on('multicopy', () => diff.disable());
	
	listVM.on('filtered', () => {
		
		result.style.display = listVM.items.length && !listVM.filteredItems.length ? 'block' : 'none';
		intro.style.display = listVM.items.length ? 'none' : 'block';
		
	});
	
	list.addEventListener('copy', () => diff.disable());
	list.addEventListener('delete', () => diff.disable());
	
	list.addEventListener('selected', () => {
		
		actionsVM.enableCopy();
		diff.updateSelection();
		
	});
	
	list.addEventListener('unselected', () => {
		
		actionsVM.disableCopy();
		navigator.clearSelection();
		
	});
	
	list.addEventListener('scroll', () => diff.setScrollbarPosition());
	list.addEventListener('filtered', () => diff.updateNavigator());
	
	document.addEventListener('mouseup', ({ target }) => {
		
		if (list.disabled) return;
		
		if (target === document.body || target === document.documentElement) list.unselect();
		
	});
	
	const focusListView = () => {
		
		if (!left.focused && !right.focused && !search.focused) list.focus();
		
	};
	
	window.addEventListener('focus', () => {
		
		if (list.content.firstElementChild && !left.focused && !right.focused && !search.focused) {
			setTimeout(focusListView, 0);
		}
		
	});
	
}

//	Functions __________________________________________________________________

