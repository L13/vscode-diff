//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffCompareViewModel } from './l13-diff-compare.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffCompareViewModelService extends ViewModelService<L13DiffCompareViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffCompareViewModel> = L13DiffCompareViewModel;
	
}

//	Functions __________________________________________________________________

