//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { workspacePaths } from './common';
import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________

const MENU_HISTORY = 'history';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffMenu {
	
	private readonly context:vscode.ExtensionContext;
	
	private disposables:vscode.Disposable[] = [];
	
	public static clearHistory (context:vscode.ExtensionContext) :void {
		
		context.globalState.update(MENU_HISTORY, []);
		
	}
	
	public constructor (private msg:DiffMessage, context:vscode.ExtensionContext) {
		
		this.context = context;
		
		this.msg.on('update:menu', () => {
			
			this.msg.send('update:menu', {
				history: this.context.globalState.get(MENU_HISTORY) || [],
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
			});
			
		});
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	public static saveRecentlyUsed (context:vscode.ExtensionContext, pathA:string, pathB:string) :void {
		
		const maxRecentlyUsedLength:number = <number>vscode.workspace.getConfiguration('l13Diff').get('maxRecentlyUsed', 10);
		const history:string[] = context.globalState.get(MENU_HISTORY) || [];
		
		addToRecentlyUsed(history, pathB);
		addToRecentlyUsed(history, pathA);
		
		context.globalState.update(MENU_HISTORY, history.slice(0, maxRecentlyUsedLength));
		
	}
	
}

//	Functions __________________________________________________________________

function addToRecentlyUsed (history:string[], path:string) {
	
	const index = history.indexOf(path);
	
	if (index !== -1) history.splice(index, 1);
	
	history.unshift(path);
	
}