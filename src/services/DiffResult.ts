//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Diff, DiffStats, File } from '../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffResult {
	
	public total:number = 0;
	
	public stats:DiffStats = {
		total: 0,
		
		files: 0,
		folders: 0,
		symlinks: 0,
		
		conflicting: 0,
		deleted: 0,
		modified: 0,
		unchanged: 0,
		untracked: 0,
		
		eol: 0,
	};
	
	public diffs:Diff[] = [];
	
	public constructor (public pathA:string, public pathB:string) {
		
		
		
	}
	
	public createStats () :void {
		
		const stats = this.stats;
		
		Object.keys(stats).forEach((name:string) => (<any>stats)[name] = 0);
		
		this.diffs.forEach((diff:Diff) => {
			
			if (diff.fileA) fileStat(diff.fileA, stats);
			if (diff.fileB) fileStat(diff.fileB, stats);
			
			if (diff.status === 'conflicting') stats.conflicting++;
			if (diff.status === 'deleted') stats.deleted++;
			if (diff.status === 'modified') stats.modified++;
			if (diff.status === 'unchanged') stats.unchanged++;
			if (diff.status === 'untracked') stats.untracked++;
			
			if (diff.eol) stats.eol++;
			
		});
		
	}
	
	public report () :string {
		
		let text = `
File Report
Total: ${this.stats.total}
Files: ${this.stats.files}
Folders: ${this.stats.folders}
Symlinks: ${this.stats.symlinks}

Status Report
Diffs: ${this.diffs.length}
Conflicts: ${this.stats.conflicting}
Deleted: ${this.stats.deleted}
Modified: ${this.stats.modified}
Unchanged: ${this.stats.unchanged}
Untracked: ${this.stats.untracked}`;
		
		if (vscode.workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false)) {
			text += `
Ignored EOL: ${this.stats.eol}`;
		}
		
		return text;
		
	}
	
}

//	Functions __________________________________________________________________

function fileStat (file:File, stats:DiffStats) {
	
	stats.total++;
	
	if (file.type === 'file') stats.files++;
	if (file.type === 'folder') stats.folders++;
	if (file.type === 'symlink') stats.symlinks++;
	
}