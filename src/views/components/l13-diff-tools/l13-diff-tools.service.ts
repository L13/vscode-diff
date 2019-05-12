//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffToolsViewModel } from './l13-diff-tools.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffToolsViewModelService extends ViewModelService<L13DiffToolsViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffToolsViewModel> = L13DiffToolsViewModel;
	
}

//	Functions __________________________________________________________________

