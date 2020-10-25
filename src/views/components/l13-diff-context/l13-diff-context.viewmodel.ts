//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffContextViewModel extends ViewModel {
	
	private _openDisabled:boolean = false;
	
	private _copyDisabled:boolean = false;
	
	private _revealDisabled:boolean = false;
	
	private _deleteDisabled:boolean = false;
	
	get openDisabled () :boolean {
		
		return this._openDisabled;
		
	}
	
	set openDisabled (value:boolean) {
		
		this._openDisabled = value;
		this.requestUpdate();
		
	}
	
	get copyDisabled () :boolean {
		
		return this._copyDisabled;
		
	}
	
	set copyDisabled (value:boolean) {
		
		this._copyDisabled = value;
		this.requestUpdate();
		
	}
	
	get revealDisabled () :boolean {
		
		return this._revealDisabled;
		
	}
	
	set revealDisabled (value:boolean) {
		
		this._revealDisabled = value;
		this.requestUpdate();
		
	}
	
	get deleteDisabled () :boolean {
		
		return this._deleteDisabled;
		
	}
	
	set deleteDisabled (value:boolean) {
		
		this._deleteDisabled = value;
		this.requestUpdate();
		
	}
	
	public enableAll () {
		
		this._openDisabled = false;
		this._copyDisabled = false;
		this._revealDisabled = false;
		this._deleteDisabled = false;
		
		this.requestUpdate();
		
	}
	
	public disableAll () {
		
		this._openDisabled = true;
		this._copyDisabled = true;
		this._revealDisabled = true;
		this._deleteDisabled = true;
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

