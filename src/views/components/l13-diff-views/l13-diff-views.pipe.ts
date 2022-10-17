//	Imports ____________________________________________________________________

import type { Diff, ViewsCache } from '../../../types';

import type { L13DiffListPipe } from '../l13-diff-list/l13-diff-list.interface';

import type { L13DiffViewsViewModel } from './l13-diff-views.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewsPipe implements L13DiffListPipe<Diff> {
	
	private cache: ViewsCache = {
		unchangedChecked: false,
		deletedChecked: true,
		modifiedChecked: true,
		untrackedChecked: true,
		ignoredChecked: false,
		items: [],
		filteredItems: [],
	};
	
	public constructor (public readonly vm: L13DiffViewsViewModel) {}
	
	public transform (items: Diff[]): Diff[] {
		
		const cache = this.cache;
		const vm = this.vm;
		
		if (items === cache.items
			&& vm.unchangedChecked === cache.unchangedChecked
			&& vm.deletedChecked === cache.deletedChecked
			&& vm.modifiedChecked === cache.modifiedChecked
			&& vm.untrackedChecked === cache.untrackedChecked
			&& vm.ignoredChecked === cache.ignoredChecked
		) {
			return cache.filteredItems;
		}
		
		cache.items = items;
		cache.unchangedChecked = vm.unchangedChecked;
		cache.deletedChecked = vm.deletedChecked;
		cache.modifiedChecked = vm.modifiedChecked;
		cache.untrackedChecked = vm.untrackedChecked;
		cache.ignoredChecked = vm.ignoredChecked;
		
		return cache.filteredItems = items.filter((diff: Diff) => {
			
			return vm.unchangedChecked && diff.status === 'unchanged'
				|| vm.deletedChecked && diff.status === 'deleted'
				|| vm.modifiedChecked && (diff.status === 'modified' || diff.status === 'conflicting')
				|| vm.untrackedChecked && diff.status === 'untracked'
				|| vm.ignoredChecked && diff.status === 'ignored';
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

