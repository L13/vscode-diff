//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Comparison } from '../../types';
import { formatNameAndDesc } from '../@l13/utils/formats';

import * as dialogs from '../../common/dialogs';
import * as settings from '../../common/settings';

import { HistoryTreeItem } from './trees/HistoryTreeItem';

//	Variables __________________________________________________________________

const COMPARISONS_HISTORY = 'comparisons';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffHistory implements vscode.TreeDataProvider<HistoryTreeItem> {
	
	private _onDidChangeTreeData:vscode.EventEmitter<HistoryTreeItem|undefined> = new vscode.EventEmitter<HistoryTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<HistoryTreeItem|undefined> = this._onDidChangeTreeData.event;
	
	public comparisons:Comparison[] = [];
	
	public static currentProvider:DiffHistory|undefined;
	
	public static createProvider (context:vscode.ExtensionContext) {
		
		return DiffHistory.currentProvider || (DiffHistory.currentProvider = new DiffHistory(context));
		
	}
	
	private constructor (private context:vscode.ExtensionContext) {
		
		this.comparisons = this.context.globalState.get(COMPARISONS_HISTORY) || [];
		
	}
	
	public refresh () :void {
		
		this.comparisons = this.context.globalState.get(COMPARISONS_HISTORY) || [];
		
		this._onDidChangeTreeData.fire(undefined);
		
	}
	
	public getTreeItem (element:HistoryTreeItem) :vscode.TreeItem {
		
		return element;
		
	}
	
	public getChildren () :Thenable<HistoryTreeItem[]> {
		
		const list:(HistoryTreeItem)[] = [];
		
		if (!this.comparisons.length) return Promise.resolve(list);
		
		return Promise.resolve(list.concat(this.comparisons.map((comparison) => new HistoryTreeItem(comparison))));
		
	}
	
	public static saveComparison (context:vscode.ExtensionContext, pathA:string, pathB:string) :void {
		
		const maxHistoryEntriesLength:number = <number>settings.get('maxHistoryEntries', 10);
		const comparisons:Comparison[] = context.globalState.get(COMPARISONS_HISTORY) || [];
		let comparison:Comparison = null;
		let i = 0;
		
		while ((comparison = comparisons[i++])) {
			if (comparison.fileA === pathA && comparison.fileB === pathB) {
				comparisons.splice(--i, 1);
				break;
			}
		}
		
		const [label, desc] = formatNameAndDesc(pathA, pathB);
		
		comparisons.unshift({
			fileA: pathA,
			fileB: pathB,
			label,
			desc,
		});
		
		context.globalState.update(COMPARISONS_HISTORY, comparisons.slice(0, maxHistoryEntriesLength));
		
	}
	
	public static async removeComparison (context:vscode.ExtensionContext, comparison:Comparison) {
		
		const text = `Delete comparison '${`${comparison.label}${comparison.desc ? ` (${comparison.desc})` : ''}`}'?`;
		
		if (await dialogs.confirm(text, 'Delete')) {
			const comparisons:Comparison[] = context.globalState.get(COMPARISONS_HISTORY) || [];
			
			for (let i = 0; i < comparisons.length; i++) {
				if (comparisons[i].label === comparison.label) {
					comparisons.splice(i, 1);
					context.globalState.update(COMPARISONS_HISTORY, comparisons);
					DiffHistory.createProvider(context).refresh();
					return;
				}
			}
			
			vscode.window.showErrorMessage(`Comparison does not exist`);
		}
		
	}
	
	public static clearComparisons (context:vscode.ExtensionContext) {
		
		context.globalState.update(COMPARISONS_HISTORY, []);
		DiffHistory.createProvider(context).refresh();
		
	}
	
}

//	Functions __________________________________________________________________

