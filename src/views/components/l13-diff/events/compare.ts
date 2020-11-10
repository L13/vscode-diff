//	Imports ____________________________________________________________________

import { msg } from '../../common';

import { L13DiffCompareComponent } from '../../l13-diff-compare/l13-diff-compare.component';

import { L13DiffComponent } from '../l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, compare:L13DiffCompareComponent) {
	
	compare.addEventListener('compare', (event) => {
			
		if ((<any>(<MouseEvent>event).detail).altKey) msg.send('compare:multi');
		else diff.initCompare();
		
	});
	
	msg.on('compare:multi', () => diff.initCompare());
	
}

//	Functions __________________________________________________________________

