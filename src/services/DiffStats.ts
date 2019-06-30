//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Diff, File } from '../types';
import { DiffResult } from './DiffResult';

//	Variables __________________________________________________________________

const KB:number = 1024;
const MB:number = KB * KB;
const GB:number = KB * MB;
const TB:number = KB * GB;
const PB:number = KB * TB;

type FolderStats = {
	pathname:string,
	total:number,
	files:number,
	folders:number,
	symlinks:number,
	size:number,
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffStats {
	
	public pathA:FolderStats = {
		pathname: '',
		total: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		size: 0,
	};
	
	public pathB:FolderStats = {
		pathname: '',
		total: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		size: 0,
	};
	
	public total:number = 0;
	public size:number = 0;
	
	public files:number = 0;
	public folders:number = 0;
	public symlinks:number = 0;
	
	public conflicting:number = 0;
	public deleted:number = 0;
	public modified:number = 0;
	public unchanged:number = 0;
	public untracked:number = 0;
	
	public eol:number = 0;
	
	public constructor (private result:DiffResult) {
		
		this.createStats();
		
	}
	
	private createStats () :void {
		
		const result = this.result;
		
		this.pathA.pathname = result.pathA;
		this.pathB.pathname = result.pathB;
		
		result.diffs.forEach((diff:Diff) => {
			
			if (diff.fileA) fileStat(diff.fileA, this.pathA);
			if (diff.fileB) fileStat(diff.fileB, this.pathB);
			
			if (diff.status === 'conflicting') this.conflicting++;
			if (diff.status === 'deleted') this.deleted++;
			if (diff.status === 'modified') this.modified++;
			if (diff.status === 'unchanged') this.unchanged++;
			if (diff.status === 'untracked') this.untracked++;
			
			if (diff.eol) this.eol++;
			
		});
		
		this.total = this.pathA.total + this.pathB.total;
		this.size = this.pathA.size + this.pathB.size;
	
		this.files = this.pathA.files + this.pathB.files;
		this.folders = this.pathA.folders + this.pathB.folders;
		this.symlinks = this.pathA.symlinks + this.pathB.symlinks;
		
	}
	
	public report () :string {
		
		let text = 'RESULT';
		
		text += '\n\n';
		text += 'Compared:    ' + formatBasicStats(`${this.pathA.pathname} ↔ ${this.pathB.pathname}`, this);
		text += '\n\n';
		text += 'Path:        ' + formatBasicStats(this.pathA.pathname, this.pathA);
		text += '\n\n';
		text += 'Path:        ' + formatBasicStats(this.pathB.pathname, this.pathB);
		text += '\n\n\n';
		text += `STATUS

Diffs:       ${this.result.diffs.length}
Conflicts:   ${this.conflicting}
Deleted:     ${this.deleted}
Modified:    ${this.modified}
Unchanged:   ${this.unchanged}
Untracked:   ${this.untracked}`;
		
		if (vscode.workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false)) {
			text += `
Ignored EOL: ${this.eol}`;
		}
		
		return text;
		
	}
	
}

//	Functions __________________________________________________________________

function fileStat (file:File, stats:FolderStats) {
	
	stats.total++;
	stats.size += file.stat.size;
	
	if (file.type === 'file') stats.files++;
	if (file.type === 'folder') stats.folders++;
	if (file.type === 'symlink') stats.symlinks++;
	
}

function formatFileSize (size:number) {
	
	if (size > PB) return `${(size / PB).toFixed(2)} PB`;
	if (size > TB) return `${(size / TB).toFixed(2)} TB`;
	if (size > GB) return `${(size / GB).toFixed(2)} GB`;
	if (size > MB) return `${(size / MB).toFixed(2)} MB`;
	if (size > KB) return `${(size / KB).toFixed(2)} KB`;
	
	return `${size} Byte`;
	
}

function formatBasicStats (name:string, stats:DiffStats|FolderStats) {
	
	return `${name}
Total:       ${stats.total}
Size:        ${formatFileSize(stats.size)} (${stats.size} Byte)
Files:       ${stats.files}
Folders:     ${stats.folders}`;
// Symlinks: ${stats.symlinks}`;
	
}