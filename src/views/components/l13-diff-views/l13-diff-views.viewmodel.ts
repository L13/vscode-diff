//	Imports ____________________________________________________________________

import { ViewsState } from '../../../types';

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffViewsViewModel extends ViewModel {
	
	public disabled = false;
	
	public disable () {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	public unchangedChecked = false;
	
	public deletedChecked = true;
	
	public modifiedChecked = true;
	
	public untrackedChecked = true;
	
	public ignoredChecked = false;
	
	public getState (): ViewsState {
		
		return {
			unchangedChecked: this.unchangedChecked,
			deletedChecked: this.deletedChecked,
			modifiedChecked: this.modifiedChecked,
			untrackedChecked: this.untrackedChecked,
			ignoredChecked: this.ignoredChecked,
		};
		
	}
	
	public setState (state: ViewsState) {
		
		this.unchangedChecked = state.unchangedChecked;
		this.deletedChecked = state.deletedChecked;
		this.modifiedChecked = state.modifiedChecked;
		this.untrackedChecked = state.untrackedChecked;
		this.ignoredChecked = state.ignoredChecked;
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

