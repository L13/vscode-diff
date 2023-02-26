//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Comparison } from '../../types';
import type { HistoryStates, RefreshHistoryStates } from '../@types/history';

import { HistoryTreeItem } from './trees/HistoryTreeItem';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryProvider implements vscode.TreeDataProvider<HistoryTreeItem> {
	
	private _onDidChangeTreeData: vscode.EventEmitter<HistoryTreeItem | undefined> = new vscode.EventEmitter<HistoryTreeItem | undefined>();
	public readonly onDidChangeTreeData: vscode.Event<HistoryTreeItem | undefined> = this._onDidChangeTreeData.event;
	
	public comparisons: Comparison[] = [];
	
	public static current: HistoryProvider | undefined;
	
	public static create (states: HistoryStates) {
		
		return HistoryProvider.current || (HistoryProvider.current = new HistoryProvider(states));
		
	}
	
	private constructor (states: HistoryStates) {
		
		this.comparisons = states.comparisons;
		
	}
	
	public dispose () {
		
		HistoryProvider.current = null;
		
	}
	
	public refresh (states?: RefreshHistoryStates) {
		
		if (states?.comparisons) this.comparisons = states.comparisons;
		
		this._onDidChangeTreeData.fire(undefined);
		
	}
	
	public getTreeItem (element: HistoryTreeItem): vscode.TreeItem {
		
		return element;
		
	}
	
	public getChildren (): Thenable<HistoryTreeItem[]> {
		
		const list: HistoryTreeItem[] = [];
		
		this.comparisons.forEach((comparison) => list.push(new HistoryTreeItem(comparison)));
		
		return Promise.resolve(list);
		
	}
	
}

//	Functions __________________________________________________________________

