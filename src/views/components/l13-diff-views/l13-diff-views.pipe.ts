//	Imports ____________________________________________________________________

import { L13DiffListPipe } from '../l13-diff-list/l13-diff-list.interface';

import { L13DiffViewsViewModelService } from './l13-diff-views.service';
import { L13DiffViewsViewModel } from './l13-diff-views.viewmodel';

import { Diff, ViewsCache } from '../../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewsPipe implements L13DiffListPipe<Diff> {
	
	public vm:L13DiffViewsViewModel = null;
	
	private cache:ViewsCache = {
		unchangedChecked: false,
		deletedChecked: true,
		modifiedChecked: true,
		untrackedChecked: true,
		items: [],
		filteredItems: [],
	};
	
	public constructor (vmOrVmId:string|L13DiffViewsViewModel) {
		
		this.vm = typeof vmOrVmId === 'string' ? new L13DiffViewsViewModelService().model(vmOrVmId) : vmOrVmId;
		
	}
	
	public transform (items:Diff[]) :Diff[] {
		
		const cache = this.cache;
		const vm = this.vm;
		
		if (items === cache.items
			&& vm.unchangedChecked === cache.unchangedChecked
			&& vm.deletedChecked === cache.deletedChecked
			&& vm.modifiedChecked === cache.modifiedChecked
			&& vm.untrackedChecked === cache.untrackedChecked
			) {
			return cache.filteredItems;
		}
		
		cache.items = items;
		cache.unchangedChecked = vm.unchangedChecked;
		cache.deletedChecked = vm.deletedChecked;
		cache.modifiedChecked = vm.modifiedChecked;
		cache.untrackedChecked = vm.untrackedChecked;
		
		return cache.filteredItems = items.filter((diff:Diff) => {
			
			return vm.unchangedChecked && diff.status === 'unchanged'
				|| vm.deletedChecked && diff.status === 'deleted'
				|| vm.modifiedChecked && (diff.status === 'modified' || diff.status === 'conflicting')
				|| vm.untrackedChecked && diff.status === 'untracked';
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

