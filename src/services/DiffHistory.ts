//	Imports ____________________________________________________________________

import { normalize, sep } from 'path';
import * as vscode from 'vscode';

import { Comparison } from '../types';

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
		
		this._onDidChangeTreeData.fire();
		
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
		
		const maxHistoryEntriesLength:number = <number>vscode.workspace.getConfiguration('l13Diff').get('maxHistoryEntries', 10);
		const comparisons:Comparison[] = context.globalState.get(COMPARISONS_HISTORY) || [];
		let comparison:Comparison = null;
		let i = 0;
		
		while ((comparison = comparisons[i++])) {
			if (comparison.fileA === pathA && comparison.fileB === pathB) {
				comparisons.splice(--i, 1);
				break;
			}
		}
		
		comparisons.unshift(formatNameAndDesc({
			fileA: pathA,
			fileB: pathB,
			label: '',
			desc: '',
		}));
		
		context.globalState.update(COMPARISONS_HISTORY, comparisons.slice(0, maxHistoryEntriesLength));
		
	}
	
	public static removeComparison (context:vscode.ExtensionContext, comparison:Comparison) {
		
		vscode.window.showInformationMessage(`Delete comparison '${`${comparison.label}${comparison.desc ? ` (${comparison.desc})` : ''}`}'?`, { modal: true }, 'Delete').then((value) => {
			
			if (value) {
				
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
			
		});
		
	}
	
	public static clearComparisons (context:vscode.ExtensionContext) {
		
		context.globalState.update(COMPARISONS_HISTORY, []);
		DiffHistory.createProvider(context).refresh();
		
	}
	
}

//	Functions __________________________________________________________________

function formatNameAndDesc (comparison:Comparison) :Comparison {
	
	const fileA:string[] = normalize(comparison.fileA).split(sep);
	const fileB:string[] = normalize(comparison.fileB).split(sep);
	const desc:string[] = [];
	
//	Remove last entry if path has a slash/backslash at the end
	if (!fileA[fileA.length - 1]) fileA.pop();
	if (!fileB[fileB.length - 1]) fileB.pop();
	
	while (fileA.length > 1 && fileB.length > 1 && fileA[0] === fileB[0]) {
		desc.push(fileA.shift());
		fileB.shift();
	}
	
//	Fix for absolute and network paths if folders are part of the root
	if (desc.length && desc.join('') === '') {
		desc.forEach((value, index) => {
			
			fileA.splice(index, 0, value);
			fileB.splice(index, 0, value);
			
		});
		desc.splice(0, desc.length);
	}
	
	comparison.label = `${fileA.join(sep)} ↔ ${fileB.join(sep)}`;
	comparison.desc = desc.join(sep);
	
	return comparison;
	
}