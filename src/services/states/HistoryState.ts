//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Comparison } from '../../types';
import { formatNameAndDesc } from '../@l13/formats';

import * as dialogs from '../common/dialogs';
import * as settings from '../common/settings';
import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryState {
	
	private static currentHistoryState:HistoryState = null;
	
	public static createHistoryState (context:vscode.ExtensionContext) {
		
		return HistoryState.currentHistoryState || (HistoryState.currentHistoryState = new HistoryState(context));
		
	}
	
	public constructor (private readonly context:vscode.ExtensionContext) {}
	
	// private _onDidUpdateComparison:vscode.EventEmitter<Comparison> = new vscode.EventEmitter<Comparison>();
	// public readonly onDidUpdateComparison:vscode.Event<Comparison> = this._onDidUpdateComparison.event;
	
	private _onDidDeleteComparison:vscode.EventEmitter<Comparison> = new vscode.EventEmitter<Comparison>();
	public readonly onDidDeleteComparison:vscode.Event<Comparison> = this._onDidDeleteComparison.event;
	
	private _onDidChangeComparisons:vscode.EventEmitter<Comparison[]> = new vscode.EventEmitter<Comparison[]>();
	public readonly onDidChangeComparisons:vscode.Event<Comparison[]> = this._onDidChangeComparisons.event;
	
	public getComparisons () {
		
		return states.getComparisons(this.context);
		
	}
	
	public addComparison (pathA:string, pathB:string) :void {
		
		const maxHistoryEntriesLength:number = <number>settings.get('maxHistoryEntries', 10);
		let comparisons = states.getComparisons(this.context);
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
		
		comparisons = comparisons.slice(0, maxHistoryEntriesLength)
		
		states.updateComparisons(this.context, comparisons);
		this._onDidChangeComparisons.fire(comparisons);
		
	}
	
	public async removeComparison (comparison:Comparison) {
		
		const text = `Delete comparison '${`${comparison.label}${comparison.desc ? ` (${comparison.desc})` : ''}`}'?`;
		
		if (await dialogs.confirm(text, 'Delete')) {
			const comparisons = states.getComparisons(this.context);
			
			for (let i = 0; i < comparisons.length; i++) {
				if (comparisons[i].label === comparison.label) {
					comparisons.splice(i, 1);
					states.updateComparisons(this.context, comparisons);
					this._onDidDeleteComparison.fire(comparison);
					this._onDidChangeComparisons.fire(comparisons);
					return;
				}
			}
		}
		
	}
	
	public clearComparisons () {
		
		states.updateComparisons(this.context, []);
		
		this._onDidChangeComparisons.fire([]);
		
	}
	
}

//	Functions __________________________________________________________________

