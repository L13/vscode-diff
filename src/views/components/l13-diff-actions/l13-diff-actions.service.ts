//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffActionsViewModel } from './l13-diff-actions.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffActionsViewModelService extends ViewModelService<L13DiffActionsViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffActionsViewModel> = L13DiffActionsViewModel;
	
}

//	Functions __________________________________________________________________

