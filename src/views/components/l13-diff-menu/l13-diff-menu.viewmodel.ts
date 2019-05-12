//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';
import { vscode } from '../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffMenuViewModel extends ViewModel {
	
	public history:string[] = [];
	
	public workspaces:string[] = [];
	
	public async update () {
			
		const self = this;
			
		return new Promise((resolve, reject) => {
			
			window.addEventListener('message', function update (event) {
				
				const message = event.data;
				
				if (message.command === 'update:menu') {
					self.updateHistory(message.history);
					self.updateWorkspaces(message.workspaces);
					window.removeEventListener('message', update);
					resolve();
				}
				
			});
			
			vscode.postMessage({
				command: 'update:menu',
			});
			
		});
		
	}
		
	private updateHistory (history:string[]) {
		
		if (history && history.length) {
			if (('' + history) !== '' + this.history) {
				this.history = history;
				this.requestUpdate();
			}
		} else this.history = [];
		
	}
	
	private updateWorkspaces (workspaces:string[]) {
		
		if (workspaces && workspaces.length) {
			if (('' + workspaces) !== '' + this.workspaces) {
				this.workspaces = workspaces;
				this.requestUpdate();
			}
		} else this.workspaces = [];
		
	}
	
}

//	Functions __________________________________________________________________

