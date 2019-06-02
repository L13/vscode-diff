//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffIntroViewModel } from './l13-diff-intro.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffIntroViewModelService extends ViewModelService<L13DiffIntroViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffIntroViewModel> = L13DiffIntroViewModel;
	
}

//	Functions __________________________________________________________________

