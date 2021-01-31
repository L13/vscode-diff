//	Imports ____________________________________________________________________

import { L13Element } from './component.abstract';
import { ViewModelConstructor } from '../../@types/components';
import { ViewModel } from './view-model.abstract';

//	Variables __________________________________________________________________

const viewmodels = new Map();

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export abstract class ViewModelService<T extends ViewModel> {
	
	public abstract vmc:ViewModelConstructor<T>;
	
	public model (vmId:string|L13Element<T>) :T {
		
		if ((<L13Element<T>>vmId).viewmodel) return (<L13Element<T>>vmId).viewmodel;
		
		let collection = viewmodels.get(this.vmc);
		
		if (!collection) {
			collection = new Map();
			viewmodels.set(this.vmc, collection);
		}
		
		let viewmodel = collection.get(vmId);
		
		if (viewmodel) return viewmodel;
		
		viewmodel = new this.vmc();
		viewmodel.id = vmId;
		
		collection.set(vmId, viewmodel);
		
		return viewmodel;
		
	}
	
	public static requestUpdate (vmc?:new () => any) :void {
		
		if (vmc) {
			const collection = viewmodels.get(vmc);
			if (collection) {
				for (const vm of collection) vm.requestUpdate();
			}
		} else {
			for (const collection of viewmodels) {
				for (const vm of collection) vm.requestUpdate();
			}
		}
		
	}
	
}

//	Functions __________________________________________________________________

