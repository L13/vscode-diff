//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/arrays';

import * as settings from '../common/settings';

//	Variables __________________________________________________________________

const MENU_HISTORY = 'history';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffMenu {
	
	public static getHistory (context:vscode.ExtensionContext) {
		
		return context.globalState.get(MENU_HISTORY) || []
		
	}
	
	public static saveRecentlyUsed (context:vscode.ExtensionContext, pathA:string, pathB:string) :void {
		
		const maxRecentlyUsedLength:number = <number>settings.get('maxRecentlyUsed', 10);
		const history:string[] = context.globalState.get(MENU_HISTORY) || [];
		
		addToRecentlyUsed(history, pathB);
		addToRecentlyUsed(history, pathA);
		
		context.globalState.update(MENU_HISTORY, history.slice(0, maxRecentlyUsedLength));
		
	}
	
	public static clearHistory (context:vscode.ExtensionContext) :void {
		
		context.globalState.update(MENU_HISTORY, []);
		
	}
	
}

//	Functions __________________________________________________________________

function addToRecentlyUsed (history:string[], path:string) {
	
	remove(history, path);
	history.unshift(path);
	
}