//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffSearchViewModel } from './l13-diff-search.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSearchViewModelService extends ViewModelService<L13DiffSearchViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffSearchViewModel> = L13DiffSearchViewModel;
	
}

//	Functions __________________________________________________________________

