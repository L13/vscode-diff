//	Imports ____________________________________________________________________

import type { InputEventsInit } from '../../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, left, right, menu }: InputEventsInit) {
	
	left.menu = menu;
	right.menu = menu;
	
	left.addEventListener('compare', () => diff.initCompare());
	right.addEventListener('compare', () => diff.initCompare());
	
}

//	Functions __________________________________________________________________

