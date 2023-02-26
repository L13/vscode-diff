//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import type { ViewModelConstructor } from '../../@types/components';

import { L13DiffSwapViewModel } from './l13-diff-swap.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSwapViewModelService extends ViewModelService<L13DiffSwapViewModel> {
	
	public name = 'l13-diff-swap';
	
	public vmc: ViewModelConstructor<L13DiffSwapViewModel> = L13DiffSwapViewModel;
	
}

//	Functions __________________________________________________________________

