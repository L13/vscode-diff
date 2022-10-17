//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';
import type { ViewModelConstructor } from '../../@types/components';

import { L13DiffViewModel } from './l13-diff.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewModelService extends ViewModelService<L13DiffViewModel> {
	
	public name = 'l13-diff';
	
	public vmc: ViewModelConstructor<L13DiffViewModel> = L13DiffViewModel;
	
}

//	Functions __________________________________________________________________

