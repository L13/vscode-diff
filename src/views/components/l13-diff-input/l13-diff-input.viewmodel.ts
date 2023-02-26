//	Imports ____________________________________________________________________

import type { DiffDialogMessage } from '../../../types';

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { msg } from '../../common';

//	Variables __________________________________________________________________

const VALUE = Symbol.for('value');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffInputViewModel extends ViewModel {
	
	public disabled = false;
	
	public disable () {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	private [VALUE] = '';
	
	public get value () {
		
		return this[VALUE];
		
	}
	
	public set value (val) {
		
		this[VALUE] = val;
		this.requestUpdate();
		
	}
	
	private eventName: string = null;
	
	private dialogListener = (data: DiffDialogMessage) => {
	
	
		if (data.fsPath) this.value = data.fsPath;
		
		msg.removeMessageListener(this.eventName, this.dialogListener);
		
		this.eventName = null;
		
	};
	
	public pick (file = false) {
		
		this.eventName = `dialog:${file ? 'file' : 'folder'}`;
		
		msg.on(this.eventName, this.dialogListener);
		msg.send(this.eventName);
		
	}
	
}

//	Functions __________________________________________________________________

