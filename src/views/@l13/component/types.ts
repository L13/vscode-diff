//	Imports ____________________________________________________________________

import { ViewModelService } from './view-model-service.abstract';
import { ViewModel } from './view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Options = {
	name:string,
	service:any,
	styles?:string[],
	template?:string,
};

export type ViewModelConstructor<T extends ViewModel> = new (options?:object)  => T;

//	Functions __________________________________________________________________

