//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffPanelViewModel } from './l13-diff-panel.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffPanelViewModelService extends ViewModelService<L13DiffPanelViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffPanelViewModel> = L13DiffPanelViewModel;
	
}

//	Functions __________________________________________________________________

