//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import type { ViewModelConstructor } from '../../@types/components';

import { L13DiffContextViewModel } from './l13-diff-context.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffContextViewModelService extends ViewModelService<L13DiffContextViewModel> {
	
	public name = 'l13-diff-context';
	
	public vmc: ViewModelConstructor<L13DiffContextViewModel> = L13DiffContextViewModel;
	
}

//	Functions __________________________________________________________________

