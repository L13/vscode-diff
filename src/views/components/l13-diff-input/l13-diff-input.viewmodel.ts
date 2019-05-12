//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { vscode } from '../common';

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
	
	private openListener = (event:MessageEvent) => {
			
		const message = event.data;
		if (message.command === 'open:dialog') {
			this.value = message.folder;
			window.removeEventListener('message', this.openListener);
		}
		
	}
		
	public openDialog () {
		
		window.addEventListener('message', this.openListener);
		
		vscode.postMessage({
			command: 'open:dialog',
		});
		
	}
	
}

//	Functions __________________________________________________________________

