//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/arrays';

import * as settings from '../common/settings';
import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class MenuState {
	
	private static currentMenuState:MenuState = null;
	
	public static createMenuState (context:vscode.ExtensionContext) {
		
		return MenuState.currentMenuState || (MenuState.currentMenuState = new MenuState(context));
		
	}
	
	public constructor (private readonly context:vscode.ExtensionContext) {}
	
	// private _onDidUpdateHistory:vscode.EventEmitter<string> = new vscode.EventEmitter<string>();
	// public readonly onDidUpdateHistory:vscode.Event<string> = Menu._onDidUpdateHistory.event;
	
	// private _onDidDeleteHistory:vscode.EventEmitter<string> = new vscode.EventEmitter<string>();
	// public readonly onDidDeleteHistory:vscode.Event<string> = Menu._onDidDeleteHistory.event;
	
	private _onDidChangeHistory:vscode.EventEmitter<string[]> = new vscode.EventEmitter<string[]>();
	public readonly onDidChangeHistory:vscode.Event<string[]> = this._onDidChangeHistory.event;
	
	public getHistory () {
		
		return states.getHistory(this.context);
		
	}
	
	public saveRecentlyUsed (pathA:string, pathB:string) {
		
		const maxRecentlyUsedLength:number = <number>settings.get('maxRecentlyUsed', 10);
		let history:string[] = states.getHistory(this.context);
		
		addToRecentlyUsed(history, pathB);
		addToRecentlyUsed(history, pathA);
		
		history = history.slice(0, maxRecentlyUsedLength);
		
		states.updateHistory(this.context, history);
		
		this._onDidChangeHistory.fire(history);
		
	}
	
	public clearHistory () {
		
		states.updateHistory(this.context, []);
		
		this._onDidChangeHistory.fire([]);
		
	}
	
}

//	Functions __________________________________________________________________

function addToRecentlyUsed (history:string[], path:string) {
	
	remove(history, path);
	history.unshift(path);
	
}