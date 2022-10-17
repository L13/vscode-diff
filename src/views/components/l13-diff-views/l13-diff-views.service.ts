//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';
import { ViewModelConstructor } from '../../@types/components';

import { L13DiffViewsViewModel } from './l13-diff-views.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewsViewModelService extends ViewModelService<L13DiffViewsViewModel> {
	
	public name = 'l13-diff-views';
	
	public vmc: ViewModelConstructor<L13DiffViewsViewModel> = L13DiffViewsViewModel;
	
}

//	Functions __________________________________________________________________

