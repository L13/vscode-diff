//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffActionsViewModel extends ViewModel {
	
	public selectDisabled:boolean = true;
	
	public copyDisabled:boolean = true;
	
	public disable () :void {
		
		this.selectDisabled = true;
		this.copyDisabled = true;
		this.requestUpdate();
		
	}
	
	public enable () :void {
		
		this.selectDisabled = false;
		this.copyDisabled = false;
		this.requestUpdate();
		
	}
	
	public disableCopy () :void {
		
		this.copyDisabled = true;
		this.requestUpdate();
		
	}
	
	public enableCopy () :void {
		
		this.copyDisabled = false;
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

