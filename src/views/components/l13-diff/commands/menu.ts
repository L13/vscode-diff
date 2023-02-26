//	Imports ____________________________________________________________________

import type { MenuCommandsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ menu }: MenuCommandsInit) {
	
	msg.on('l13Diff.action.menu.close', () => {
		
		if (menu && menu.parentNode) menu.remove();
		
	});
	
}

//	Functions __________________________________________________________________

