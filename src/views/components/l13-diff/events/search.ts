//	Imports ____________________________________________________________________

import { L13DiffListComponent } from '../../l13-diff-list/l13-diff-list.component';
import { L13DiffNavigatorComponent } from '../../l13-diff-navigator/l13-diff-navigator.component';

import { L13DiffSearchComponent } from '../../l13-diff-search/l13-diff-search.component';
import { L13DiffComponent } from '../l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, search:L13DiffSearchComponent, list:L13DiffListComponent, navigator:L13DiffNavigatorComponent) {
	
	search.addEventListener('close', () => {
		
		list.classList.remove('-widgets');
		search.classList.add('-moveout');
		
	});
	
	search.addEventListener('animationend', () => {
		
		if (search.classList.contains('-moveout')) {
			navigator.classList.remove('-widgets');
			search.classList.remove('-moveout');
			search.viewmodel.disable();
			search.remove();
		} else {
			navigator.classList.add('-widgets');
			search.classList.remove('-movein');
		}
		
		diff.updateNavigator();
		diff.updateSelection();
		
	});
	
}

//	Functions __________________________________________________________________

