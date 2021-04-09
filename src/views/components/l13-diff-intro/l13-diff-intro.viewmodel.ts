//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffIntroViewModel extends ViewModel {
	
	public disabled = false;
	
	public disable () {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

