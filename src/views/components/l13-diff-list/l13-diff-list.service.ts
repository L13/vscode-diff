//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import type { ViewModelConstructor } from '../../@types/components';

import { L13DiffListViewModel } from './l13-diff-list.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffListViewModelService extends ViewModelService<L13DiffListViewModel> {
	
	public name = 'l13-diff-list';
	
	public vmc: ViewModelConstructor<L13DiffListViewModel> = L13DiffListViewModel;
	
}

//	Functions __________________________________________________________________

