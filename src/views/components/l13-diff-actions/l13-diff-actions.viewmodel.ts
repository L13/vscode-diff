//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffActionsViewModel extends ViewModel {
	
	public selectDisabled = true;
	
	public copyDisabled = true;
	
	public disable () {
		
		this.selectDisabled = true;
		this.copyDisabled = true;
		this.requestUpdate();
		
	}
	
	public enable () {
		
		this.selectDisabled = false;
		this.copyDisabled = false;
		this.requestUpdate();
		
	}
	
	public disableCopy () {
		
		this.copyDisabled = true;
		this.requestUpdate();
		
	}
	
	public enableCopy () {
		
		this.copyDisabled = false;
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

