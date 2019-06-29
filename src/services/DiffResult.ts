//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Diff, DiffStats, File } from '../types';
import { DiffOutput } from './DiffOutput';

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
	
	public report () :void {
		
		const output = DiffOutput.createOutput();
		
		output.msg();
		output.msg(`File Report`);
		output.msg(`Total: ${this.stats.total}`);
		output.msg(`Files: ${this.stats.files}`);
		output.msg(`Folders: ${this.stats.folders}`);
		// output.msg(`Symlinks: ${this.stats.symlinks}`);
		
		output.msg();
		output.msg(`Status Report`);
		output.msg(`Diffs: ${this.diffs.length}`);
		output.msg(`Conflicts: ${this.stats.conflicting}`);
		output.msg(`Deleted: ${this.stats.deleted}`);
		output.msg(`Modified: ${this.stats.modified}`);
		output.msg(`Unchanged: ${this.stats.unchanged}`);
		output.msg(`Untracked: ${this.stats.untracked}`);
		
		if (vscode.workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false)) {
			output.msg();
			output.msg(`Ignored EOL: ${this.stats.eol}`);
		}
		
	}
	
}

//	Functions __________________________________________________________________

function fileStat (file:File, stats:DiffStats) {
	
	stats.total++;
	
	if (file.type === 'file') stats.files++;
	if (file.type === 'folder') stats.folders++;
	if (file.type === 'symlink') stats.symlinks++;
	
}