//	Imports ____________________________________________________________________

import { Diff } from '../../../types';
import { ViewModel } from '../../@l13/component/view-model.abstract';
import { ListFilter } from '../l13-diff-list/l13-diff-list.interface';

//	Variables __________________________________________________________________

type Cache = {
	unchangedChecked:boolean,
	deletedChecked:boolean,
	modifiedChecked:boolean,
	untrackedChecked:boolean,
	items:Diff[],
	filteredItems:Diff[],
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewsViewModel extends ViewModel implements ListFilter {
	
	private cache:Cache = {
		unchangedChecked: false,
		deletedChecked: true,
		modifiedChecked: true,
		untrackedChecked: true,
		items: [],
		filteredItems: [],
	};
	
	public disabled:boolean = false;
	
	public disable () :void {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () :void {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	public unchangedChecked:boolean = false;
	
	public deletedChecked:boolean = true;
	
	public modifiedChecked:boolean = true;
	
	public untrackedChecked:boolean = true;
	
	public filter (items:Diff[]) :Diff[] {
		
		const cache = this.cache;
		
		if (items === cache.items
			&& this.unchangedChecked === cache.unchangedChecked
			&& this.deletedChecked === cache.deletedChecked
			&& this.modifiedChecked === cache.modifiedChecked
			&& this.untrackedChecked === cache.untrackedChecked
			) {
			return cache.filteredItems;
		}
		
		cache.items = items;
		cache.unchangedChecked = this.unchangedChecked;
		cache.deletedChecked = this.deletedChecked;
		cache.modifiedChecked = this.modifiedChecked;
		cache.untrackedChecked = this.untrackedChecked;
		
		return cache.filteredItems = items.filter((diff:Diff) => {
			
			if (this.unchangedChecked && diff.status === 'unchanged') return true;
			if (this.deletedChecked && diff.status === 'deleted') return true;
			if (this.modifiedChecked && diff.status === 'modified') return true;
			if (this.untrackedChecked && diff.status === 'untracked') return true;
			
			return false;
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

