//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffInputViewModel } from './l13-diff-input.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffInputViewModelService extends ViewModelService<L13DiffInputViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffInputViewModel> = L13DiffInputViewModel;
	
}

//	Functions __________________________________________________________________

