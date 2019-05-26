//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffListSearchViewModel } from './l13-diff-list-search.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffListSearchViewModelService extends ViewModelService<L13DiffListSearchViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffListSearchViewModel> = L13DiffListSearchViewModel;
	
}

//	Functions __________________________________________________________________

