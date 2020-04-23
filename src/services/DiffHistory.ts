//	Imports ____________________________________________________________________

import { join } from 'path';
import * as vscode from 'vscode';

//	Variables __________________________________________________________________

export type Comparison = { fileA:string, fileB:string, label:string };

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
		
		this.comparisons = this.context.globalState.get('comparisons') || [];
		
	}

	public refresh () :void {
		
		this.comparisons = this.context.globalState.get('comparisons') || [];
		
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
	
	public static removeComparison (context:vscode.ExtensionContext, comparison:Comparison) {
		
		vscode.window.showInformationMessage(`Delete comparison "${comparison.label}"?`, { modal: true }, 'Delete').then((value) => {
			
			if (value) {
				
				const comparisons:Comparison[] = context.globalState.get('comparisons') || [];
				
				for (let i = 0; i < comparisons.length; i++) {
					if (comparisons[i].label === comparison.label) {
						comparisons.splice(i, 1);
						context.globalState.update('comparisons', comparisons);
						DiffHistory.createProvider(context).refresh();
						return;
					}
				}
				
				vscode.window.showErrorMessage(`Comparison does not exist`);
			}
			
		});
		
	}
	
	public static clearComparisons (context:vscode.ExtensionContext) {
		
		context.globalState.update('comparisons', []);
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
	
}

//	Functions __________________________________________________________________

