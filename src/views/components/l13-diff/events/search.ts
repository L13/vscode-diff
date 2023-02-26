//	Imports ____________________________________________________________________

import type { SearchEventsInit } from '../../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, list, navigator, search }: SearchEventsInit) {
	
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

