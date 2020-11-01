//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { msg } from '../common';

import { DiffOpenMessage } from '../../../@types/messages';

//	Variables __________________________________________________________________

const VALUE = Symbol.for('value');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffInputViewModel extends ViewModel {
	
	public disabled:boolean = false;
	
	public disable () :void {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () :void {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	private [VALUE]:string = '';
	
	public get value () {
		
		return this[VALUE];
		
	}
	
	public set value (val) {
		
		this[VALUE] = val;
		this.requestUpdate();
		
	}
	
	private openFolderListener = (data:DiffOpenMessage) => {
			
		if (data.fsPath) this.value = data.fsPath;
		
		msg.removeMessageListener('dialog:folder', this.openFolderListener);
		
	}
		
	public openFolder () {
		
		msg.on('dialog:folder', this.openFolderListener);
		
		msg.send('dialog:folder');
		
	}
	
	private openFileListener = (data:DiffOpenMessage) => {
			
		if (data.fsPath) this.value = data.fsPath;
		
		msg.removeMessageListener('dialog:file', this.openFileListener);
		
	}
		
	public openFile () {
		
		msg.on('dialog:file', this.openFileListener);
		
		msg.send('dialog:file');
		
	}
	
}

//	Functions __________________________________________________________________

