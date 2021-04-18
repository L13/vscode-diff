//	Imports ____________________________________________________________________

import { ViewModel } from '../@l13/component/view-model.abstract';
import { ViewModelService } from '../@l13/core';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Options = {
	name:string,
	service:ViewModelServiceConstructor<ViewModelService<ViewModel>>,
	styles?:string[],
	template?:string,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ViewModelConstructor<T extends ViewModel> = new (options?:object) => T;

export type ViewModelServiceConstructor<T extends ViewModelService<ViewModel>> = new () => T;

//	Functions __________________________________________________________________

