//	Imports ____________________________________________________________________

import { join, normalize, sep } from 'path';
import * as vscode from 'vscode';

import { Comparison } from '../types';

//	Variables __________________________________________________________________

export const COMPARISONS = 'comparisons';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffHistory implements vscode.TreeDataProvider<HistoryTreeItem> {

// tslint:disable-next-line: max-line-length
	private _onDidChangeTreeData:vscode.EventEmitter<HistoryTreeItem|undefined> = new vscode.EventEmitter<HistoryTreeItem|undefined>();
	public readonly onDidChangeTreeData:vscode.Event<HistoryTreeItem|undefined> = this._onDidChangeTreeData.event;
	
	public comparisons:Comparison[] = [];
	
	public static currentProvider:DiffHistory|undefined;
	
	public static createProvider (context:vscode.ExtensionContext) {
		
		return DiffHistory.currentProvider || (DiffHistory.currentProvider = new DiffHistory(context));
		
	}

	private constructor (private context:vscode.ExtensionContext) {
		
		this.comparisons = this.context.globalState.get(COMPARISONS) || [];
		
	}

	public refresh () :void {
		
		this.comparisons = this.context.globalState.get(COMPARISONS) || [];
		
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
		const comparisons:Comparison[] = context.globalState.get(COMPARISONS) || [];
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
		
		context.globalState.update(COMPARISONS, comparisons.slice(0, maxHistoryEntriesLength));
		
	}
	
	public static removeComparison (context:vscode.ExtensionContext, comparison:Comparison) {
		
		vscode.window.showInformationMessage(`Delete comparison '${formatDeleteText(comparison)}'?`, { modal: true }, 'Delete').then((value) => {
			
			if (value) {
				
				const comparisons:Comparison[] = context.globalState.get(COMPARISONS) || [];
				
				for (let i = 0; i < comparisons.length; i++) {
					if (comparisons[i].label === comparison.label) {
						comparisons.splice(i, 1);
						context.globalState.update(COMPARISONS, comparisons);
						DiffHistory.createProvider(context).refresh();
						return;
					}
				}
				
				vscode.window.showErrorMessage(`Comparison does not exist`);
			}
			
		});
		
	}
	
	public static clearComparisons (context:vscode.ExtensionContext) {
		
		context.globalState.update(COMPARISONS, []);
		DiffHistory.createProvider(context).refresh();
		
	}
	
}

// tslint:disable-next-line: max-classes-per-file
class HistoryTreeItem extends vscode.TreeItem {
	
	public command = {
		arguments: [this],
		command: 'l13Diff.openComparison',
		title: 'Open Comparison',
	};
	
	public iconPath = {
		light: join(__filename, '..', '..', 'images', 'history-item-light.svg'),
		dark: join(__filename, '..', '..', 'images', 'history-item-dark.svg'),
	};
	
	public contextValue = 'history';
	
	public constructor (public readonly comparison:Comparison) {
		
		super(comparison.label);
		
	}
	
	public get tooltip () :string {
		
		return `${this.comparison.fileA} ↔ ${this.comparison.fileB}`;
		
	}
	
	public get description () :string {
		
		return `${this.comparison.desc || ''}`;
		
	}
	
}

//	Functions __________________________________________________________________

function formatNameAndDesc (comparison:Comparison) :Comparison {
		
	const fileA:string[] = normalize(comparison.fileA).split(sep);
	const fileB:string[] = normalize(comparison.fileB).split(sep);
	const desc:string[] = [];
	
	if (!fileA[fileA.length - 1]) fileA.pop();
	if (!fileB[fileB.length - 1]) fileB.pop();
	
	while (fileA.length > 1 && fileB.length > 1 && fileA[0] === fileB[0]) {
		desc.push(fileA.shift());
		fileB.shift();
	}
	
	if (desc.length > 1 && !desc[0]) desc[0] = sep;
	
	comparison.label = `${join.apply(null, fileA)} ↔ ${join.apply(null, fileB)}`;
	comparison.desc = join.apply(null, desc);
	
	return comparison;
	
}

function formatDeleteText (comparison:Comparison) :string {
	
	return `${comparison.label}${comparison.desc ? ` (${comparison.desc})` : ''}`;
	
}