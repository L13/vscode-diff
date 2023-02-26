//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________

const LOADING = Symbol.for('loading');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffPanelViewModel extends ViewModel {
	
	private [LOADING] = false;
	
	public get loading () {
		
		return this[LOADING];
		
	}
	
	public set loading (value: boolean) {
		
		this[LOADING] = value;
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

