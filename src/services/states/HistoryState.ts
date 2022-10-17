//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Comparison } from '../../types';

import { formatNameAndDesc } from '../@l13/formats';

import * as settings from '../common/settings';
import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryState {
	
	private static current: HistoryState = null;
	
	public static create (context: vscode.ExtensionContext) {
		
		return HistoryState.current || (HistoryState.current = new HistoryState(context));
		
	}
	
	private constructor (private readonly context: vscode.ExtensionContext) {}
	
	private _onDidChangeComparisons: vscode.EventEmitter<Comparison[]> = new vscode.EventEmitter<Comparison[]>();
	public readonly onDidChangeComparisons: vscode.Event<Comparison[]> = this._onDidChangeComparisons.event;
	
	public get () {
		
		return states.getComparisons(this.context);
		
	}
	
	private save (comparions: Comparison[]) {
		
		states.updateComparisons(this.context, comparions);
		
	}
	
	public add (pathA: string, pathB: string, type: 'file' | 'folder') {
		
		let comparisons = states.getComparisons(this.context);
		const [label, desc] = formatNameAndDesc(pathA, pathB);
		const comparison = {
			fileA: pathA,
			fileB: pathB,
			label,
			desc,
			type,
		};
		
		removeComparison(comparisons, comparison);
		comparisons.unshift(comparison);
		
		comparisons = comparisons.slice(0, settings.maxHistoryEntries());
		
		this.save(comparisons);
		this._onDidChangeComparisons.fire(comparisons);
		
	}
	
	public remove (comparison: Comparison) {
		
		const comparisons = states.getComparisons(this.context);
		
		if (removeComparison(comparisons, comparison)) {
			this.save(comparisons);
			this._onDidChangeComparisons.fire(comparisons);
		}
		
	}
	
	public clear () {
		
		this.save([]);
		this._onDidChangeComparisons.fire([]);
		
	}
	
}

//	Functions __________________________________________________________________

function removeComparison (comparisons: Comparison[], comparison: Comparison) {
	
	for (let i = 0; i < comparisons.length; i++) {
		const com = comparisons[i];
		if (com.fileA === comparison.fileA && com.fileB === comparison.fileB) {
			comparisons.splice(i, 1);
			return true;
		}
	}
	
	return false;
	
}