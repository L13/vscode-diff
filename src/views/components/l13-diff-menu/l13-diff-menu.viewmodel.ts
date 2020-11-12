//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { msg } from '../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffMenuViewModel extends ViewModel {
	
	public history:string[] = [];
	
	public workspaces:string[] = [];
	
	public async update () {
			
		const self = this;
			
		return new Promise((resolve, reject) => {
			
			msg.on('update:menu', (data) => {
				
				self.updateHistory(data.history);
				self.updateWorkspaces(data.workspaces);
				msg.removeMessageListener('update:menu', this.update);
				resolve();
				
			});
			
			msg.send('update:menu');
			
		});
		
	}
		
	private updateHistory (history:string[]) {
		
		if (history) {
			if (('' + history) !== '' + this.history) {
				this.history = history;
				this.requestUpdate();
			}
		} else this.history = [];
		
	}
	
	private updateWorkspaces (workspaces:string[]) {
		
		if (workspaces) {
			if (('' + workspaces) !== '' + this.workspaces) {
				this.workspaces = workspaces;
				this.requestUpdate();
			}
		} else this.workspaces = [];
		
	}
	
}

//	Functions __________________________________________________________________

