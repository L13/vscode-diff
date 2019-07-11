//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffMapViewModel } from './l13-diff-map.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffMapViewModelService extends ViewModelService<L13DiffMapViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffMapViewModel> = L13DiffMapViewModel;
	
}

//	Functions __________________________________________________________________

