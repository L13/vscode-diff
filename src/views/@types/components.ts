//	Imports ____________________________________________________________________

import type { ViewModel } from '../@l13/component/view-model.abstract';
import type { ViewModelService } from '../@l13/core';

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
export type ViewModelConstructor<T extends ViewModel> = new (options?:{ [name:string]:any }) => T;

export type ViewModelServiceConstructor<T extends ViewModelService<ViewModel>> = new () => T;

//	Functions __________________________________________________________________

