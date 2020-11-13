//	Imports ____________________________________________________________________

import { msg } from '../components/common';

import { L13DiffMenuComponent } from '../components/l13-diff-menu/l13-diff-menu.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (menu:L13DiffMenuComponent) {
	
	msg.on('l13Diff.action.menu.close', () => {
		
		if (menu && menu.parentNode) menu.remove();
		
	});
	
}

//	Functions __________________________________________________________________

