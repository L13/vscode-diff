//	Imports ____________________________________________________________________

import { L13DiffInputComponent } from '../components/l13-diff-input/l13-diff-input.component';
import { L13DiffMenuComponent } from '../components/l13-diff-menu/l13-diff-menu.component';

import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, left:L13DiffInputComponent, right:L13DiffInputComponent, menu:L13DiffMenuComponent) {
	
	left.menu = menu;
	right.menu = menu;
	
	left.addEventListener('compare', () => diff.initCompare());
	right.addEventListener('compare', () => diff.initCompare());
	
}

//	Functions __________________________________________________________________

