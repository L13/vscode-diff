//	Imports ____________________________________________________________________

import { L13DiffListComponent } from '../components/l13-diff-list/l13-diff-list.component';
import { L13DiffNavigatorComponent } from '../components/l13-diff-navigator/l13-diff-navigator.component';

import { L13DiffSearchComponent } from '../components/l13-diff-search/l13-diff-search.component';
import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, search:L13DiffSearchComponent, list:L13DiffListComponent, navigator:L13DiffNavigatorComponent) {
	
	search.addEventListener('close', () => {
		
		search.classList.add('-moveout');
		
	});
	
	search.addEventListener('animationend', async () => {
		
		if (search.classList.contains('-moveout')) {
			list.classList.remove('-widgets');
			navigator.classList.remove('-widgets');
			search.classList.remove('-moveout');
			search.viewmodel.disable();
			search.remove();
			list.focus();
		} else {
			list.classList.add('-widgets');
			navigator.classList.add('-widgets');
			search.classList.remove('-movein');
			await search.viewmodel.enable();
			search.focus();
		}
		
		diff.updateNavigator();
		
	});
	
}

//	Functions __________________________________________________________________

