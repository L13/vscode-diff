//	Imports ____________________________________________________________________

import type { DiffMenuMessage } from '../../../types';

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { msg } from '../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffMenuViewModel extends ViewModel {
	
	public history: string[] = [];
	
	public workspaces: string[] = [];
	
	public update () {
			
		return new Promise((resolve) => {
			
			msg.on('update:menu', (data: DiffMenuMessage) => {
				
				this.updateHistory(data.history);
				this.updateWorkspaces(data.workspaces);
				// eslint-disable-next-line @typescript-eslint/unbound-method
				msg.removeMessageListener('update:menu', this.update);
				resolve(undefined);
				
			});
			
			msg.send('update:menu');
			
		});
		
	}
		
	private updateHistory (history: string[]) {
		
		if (history) {
			if (`${history}` !== `${this.history}`) {
				this.history = history;
				this.requestUpdate();
			}
		} else this.history = [];
		
	}
	
	private updateWorkspaces (workspaces: string[]) {
		
		if (workspaces) {
			if (`${workspaces}` !== `${this.workspaces}`) {
				this.workspaces = workspaces;
				this.requestUpdate();
			}
		} else this.workspaces = [];
		
	}
	
}

//	Functions __________________________________________________________________

