//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { ViewsState } from '../../../types';

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
	
	public getState () :ViewsState {
		
		return {
			unchangedChecked: this.unchangedChecked,
			deletedChecked: this.deletedChecked,
			modifiedChecked: this.modifiedChecked,
			untrackedChecked: this.untrackedChecked,
		};
		
	}
	
	public setState (state:ViewsState) :void {
		
		this.unchangedChecked = state.unchangedChecked;
		this.deletedChecked = state.deletedChecked;
		this.modifiedChecked = state.modifiedChecked;
		this.untrackedChecked = state.untrackedChecked;
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

