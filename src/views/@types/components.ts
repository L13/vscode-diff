//	Imports ____________________________________________________________________

import type { Dictionary } from '../../types';

import type { ViewModel } from '../@l13/component/view-model.abstract';
import type { ViewModelService } from '../@l13/core';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type ComponentOptions = {
	name: string,
	service: ViewModelServiceConstructor<ViewModelService<ViewModel>>,
	styles?: string[],
	template?: string,
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ViewModelConstructor<T extends ViewModel> = new (options?: Dictionary<any>) => T;

export type ViewModelServiceConstructor<T extends ViewModelService<ViewModel>> = new () => T;

//	Functions __________________________________________________________________

