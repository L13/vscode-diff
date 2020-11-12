//	Imports ____________________________________________________________________

import { L13DiffSwapComponent } from '../components/l13-diff-swap/l13-diff-swap.component';

import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, swap:L13DiffSwapComponent) {
	
	swap.addEventListener('swap', ({ detail }:any) => diff.swapInputs(detail.altKey));
	
}

//	Functions __________________________________________________________________

