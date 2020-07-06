//	Imports ____________________________________________________________________

import { join } from 'path';
import * as vscode from 'vscode';

import { Comparison } from '../../../types';

//	Variables __________________________________________________________________

const basePath = join(__filename, '..', '..', 'images', 'history');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryTreeItem extends vscode.TreeItem {
	
	public command = {
		arguments: [this],
		command: 'l13Diff.openComparison',
		title: 'Open Comparison',
	};
	
	public iconPath = {
		light: join(basePath, 'history-item-light.svg'),
		dark: join(basePath, 'history-item-dark.svg'),
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

