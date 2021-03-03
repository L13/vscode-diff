//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Comparison } from '../../types';
import { HistoryStates, RefreshHistoryStates } from '../@types/history';

import { HistoryTreeItem } from './trees/HistoryTreeItem';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryProvider implements vscode.TreeDataProvider<HistoryTreeItem> {
	
	private _onDidChangeTreeData:vscode.EventEmitter<HistoryTreeItem|undefined> = new vscode.EventEmitter<HistoryTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<HistoryTreeItem|undefined> = this._onDidChangeTreeData.event;
	
	public comparisons:Comparison[] = [];
	
	public static currentProvider:HistoryProvider|undefined;
	
	public static createProvider (states:HistoryStates) {
		
		return HistoryProvider.currentProvider || (HistoryProvider.currentProvider = new HistoryProvider(states));
		
	}
	
	private constructor (states:HistoryStates) {
		
		this.comparisons = states.comparisons;
		
	}
	
	public refresh (states?:RefreshHistoryStates) :void {
		
		if (states?.comparisons) this.comparisons = states.comparisons;
		
		this._onDidChangeTreeData.fire(undefined);
		
	}
	
	public getTreeItem (element:HistoryTreeItem) :vscode.TreeItem {
		
		return element;
		
	}
	
	public getChildren () :Thenable<HistoryTreeItem[]> {
		
		const list:(HistoryTreeItem)[] = [];
		
		this.comparisons.forEach((comparison) => list.push(new HistoryTreeItem(comparison)));
		
		return Promise.resolve(list);
		
	}
	
}

//	Functions __________________________________________________________________

