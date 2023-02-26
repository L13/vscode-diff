//	Imports ____________________________________________________________________

import type { SwapEventsInit } from '../../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, swap }: SwapEventsInit) {
	
	swap.addEventListener('swap', ({ detail }: any) => diff.swapInputs(detail.altKey));
	
}

//	Functions __________________________________________________________________

