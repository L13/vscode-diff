//	Imports ____________________________________________________________________

import type { ViewModelConstructor } from '../../@types/components';

import type { ViewModel } from './view-model.abstract';

//	Variables __________________________________________________________________

const viewmodels = new Map<ViewModelConstructor<any>, { counter: number, vms: Map<string, ViewModel> }>();

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export abstract class ViewModelService<T extends ViewModel> {
	
	public abstract name: string;
	
	public abstract vmc: ViewModelConstructor<T>;
	
	public model (vmId: string): T {
		
		let collection = viewmodels.get(this.vmc);
		
		if (!collection) {
			collection = { counter: 1, vms: new Map<string, ViewModel>() };
			viewmodels.set(this.vmc, collection);
		}
		
		let viewmodel = collection.vms.get(vmId);
		
		if (viewmodel) return <T>viewmodel;
		
		viewmodel = new this.vmc();
		viewmodel.id = vmId || `${this.name}-${collection.counter++}`;
		
		collection.vms.set(vmId, viewmodel);
		
		return <T>viewmodel;
		
	}
	
	public static requestUpdate (vmc?: new () => ViewModel) {
		
		if (vmc) {
			const collection = viewmodels.get(vmc);
			if (collection) {
				for (const vm of collection.vms.values()) vm.requestUpdate();
			}
		} else {
			for (const collection of viewmodels.values()) {
				for (const vm of collection.vms.values()) vm.requestUpdate();
			}
		}
		
	}
	
}

//	Functions __________________________________________________________________

