//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import type { ViewModelConstructor } from '../../@types/components';

import { L13DiffNavigatorViewModel } from './l13-diff-navigator.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffNavigatorViewModelService extends ViewModelService<L13DiffNavigatorViewModel> {
	
	public name = 'l13-diff-navigator';
	
	public vmc: ViewModelConstructor<L13DiffNavigatorViewModel> = L13DiffNavigatorViewModel;
	
}

//	Functions __________________________________________________________________

