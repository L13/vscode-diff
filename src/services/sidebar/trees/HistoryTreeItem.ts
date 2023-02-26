//	Imports ____________________________________________________________________

import { join, resolve } from 'path';
import * as vscode from 'vscode';

import type { Comparison } from '../../../types';

//	Variables __________________________________________________________________

const basePath = resolve(__dirname, '..', 'images', 'history');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryTreeItem extends vscode.TreeItem {
	
	public command = {
		arguments: [this],
		command: 'l13Diff.action.history.compare',
		title: 'Compare',
	};
	
	public contextValue = 'history';
	
	public constructor (public readonly comparison: Comparison) {
		
		super(comparison.label);
		
		let type = 'item';
		
		if (comparison.type) {
			type = comparison.type;
			this.contextValue += `-${type}`;
		}
		
		this.iconPath = {
			light: join(basePath, `history-${type}-light.svg`),
			dark: join(basePath, `history-${type}-dark.svg`),
		};
		
		this.description = `${this.comparison.desc || ''}`;
		this.tooltip = `${this.comparison.fileA} ↔ ${this.comparison.fileB}`;
		
	}
	
}

//	Functions __________________________________________________________________

