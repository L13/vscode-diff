//	Imports ____________________________________________________________________

import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import type { ViewModelConstructor } from '../../@types/components';

import { L13DiffPanelViewModel } from './l13-diff-panel.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffPanelViewModelService extends ViewModelService<L13DiffPanelViewModel> {
	
	public name = 'l13-diff-panel';
	
	public vmc: ViewModelConstructor<L13DiffPanelViewModel> = L13DiffPanelViewModel;
	
}

//	Functions __________________________________________________________________

