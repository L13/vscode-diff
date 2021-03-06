//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/arrays';

import * as settings from '../common/settings';
import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class MenuState {
	
	private static current:MenuState = null;
	
	public static create (context:vscode.ExtensionContext) {
		
		return MenuState.current || (MenuState.current = new MenuState(context));
		
	}
	
	public constructor (private readonly context:vscode.ExtensionContext) {}
	
	private _onDidChangeHistory:vscode.EventEmitter<string[]> = new vscode.EventEmitter<string[]>();
	public readonly onDidChangeHistory:vscode.Event<string[]> = this._onDidChangeHistory.event;
	
	public get () {
		
		return states.getHistory(this.context);
		
	}
	
	private save (history:string[]) {
		
		states.updateHistory(this.context, history);
		
	}
	
	public saveRecentlyUsed (pathA:string, pathB:string) {
		
		let history = states.getHistory(this.context);
		
		history = history.filter((path) => path !== pathB && path !== pathB);
		history.push(pathB, pathA);
		history = history.slice(0, settings.maxRecentlyUsed());
		
		this.save(history);
		this._onDidChangeHistory.fire(history);
		
	}
	
	public clear () {
		
		this.save([]);
		this._onDidChangeHistory.fire([]);
		
	}
	
}

//	Functions __________________________________________________________________
