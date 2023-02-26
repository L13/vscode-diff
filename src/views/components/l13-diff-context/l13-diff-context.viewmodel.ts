//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________

const COPY_DISABLED = Symbol.for('copyDisabled');
const GOTO_DISABLED = Symbol.for('gotoDisabled');
const REVEAL_DISABLED = Symbol.for('revealDisabled');
const DELETE_DISABLED = Symbol.for('deleteDisabled');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffContextViewModel extends ViewModel {
	
	private [COPY_DISABLED] = false;
	
	private [GOTO_DISABLED] = false;
	
	private [REVEAL_DISABLED] = false;
	
	private [DELETE_DISABLED] = false;
	
	get copyDisabled () {
		
		return this[COPY_DISABLED];
		
	}
	
	set copyDisabled (value: boolean) {
		
		this[COPY_DISABLED] = value;
		this.requestUpdate();
		
	}
	
	get gotoDisabled () {
		
		return this[GOTO_DISABLED];
		
	}
	
	set gotoDisabled (value: boolean) {
		
		this[GOTO_DISABLED] = value;
		this.requestUpdate();
		
	}
	
	get revealDisabled () {
		
		return this[REVEAL_DISABLED];
		
	}
	
	set revealDisabled (value: boolean) {
		
		this[REVEAL_DISABLED] = value;
		this.requestUpdate();
		
	}
	
	get deleteDisabled () {
		
		return this[DELETE_DISABLED];
		
	}
	
	set deleteDisabled (value: boolean) {
		
		this[DELETE_DISABLED] = value;
		this.requestUpdate();
		
	}
	
	public enableAll () {
		
		this[COPY_DISABLED] = false;
		this[GOTO_DISABLED] = false;
		this[REVEAL_DISABLED] = false;
		this[DELETE_DISABLED] = false;
		
		this.requestUpdate();
		
	}
	
	public disableAll () {
		
		this[COPY_DISABLED] = true;
		this[GOTO_DISABLED] = true;
		this[REVEAL_DISABLED] = true;
		this[DELETE_DISABLED] = true;
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

