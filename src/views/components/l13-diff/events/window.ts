//	Imports ____________________________________________________________________

import type { WindowEventsInit } from '../../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, list, left, right, search }:WindowEventsInit) {
	
	document.addEventListener('mouseup', ({ target }) => {
		
		if (list.disabled) return;
		
		if (target === document.body || target === document.documentElement) list.unselect();
		
	});
	
	window.addEventListener('theme', () => diff.updateNavigator());
	
	window.addEventListener('resize', () => {
		
		list.showVisibleListViewItems(true);
		diff.updateNavigator();
		
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

