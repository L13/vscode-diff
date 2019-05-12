//	Imports ____________________________________________________________________

import { ViewModelConstructor } from '../../@l13/component/types';
import { ViewModelService } from '../../@l13/component/view-model-service.abstract';

import { L13DiffFoldersViewModel } from './l13-diff-folders.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffFoldersViewModelService extends ViewModelService<L13DiffFoldersViewModel> {
	
	public vmc:ViewModelConstructor<L13DiffFoldersViewModel> = L13DiffFoldersViewModel;
	
}

//	Functions __________________________________________________________________

