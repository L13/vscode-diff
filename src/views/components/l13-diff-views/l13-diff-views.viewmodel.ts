//	Imports ____________________________________________________________________

import { ViewsState } from '../../../types';

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewsViewModel extends ViewModel {
	
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
	
	public ignoredChecked:boolean = false;
	
	public getState () :ViewsState {
		
		return {
			unchangedChecked: this.unchangedChecked,
			deletedChecked: this.deletedChecked,
			modifiedChecked: this.modifiedChecked,
			untrackedChecked: this.untrackedChecked,
			ignoredChecked: this.ignoredChecked,
		};
		
	}
	
	public setState (state:ViewsState) :void {
		
		this.unchangedChecked = state.unchangedChecked;
		this.deletedChecked = state.deletedChecked;
		this.modifiedChecked = state.modifiedChecked;
		this.untrackedChecked = state.untrackedChecked;
		this.ignoredChecked = state.ignoredChecked;
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

