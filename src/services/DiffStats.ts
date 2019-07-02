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

const pluralFiles:Plural = { size: 'files', 1: 'file' };
const pluralFolders:Plural = { size: 'folders', 1: 'folder' };
const pluralBytes:Plural = { size: 'Bytes', 1: 'Byte' };

type FolderStats = {
	pathname:string,
	total:number,
	files:number,
	folders:number,
	symlinks:number,
	size:number,
};

type Plural = {
	size:string,
	[index:number]:string,
};

type DetailStats = {
	total:number,
	size:number,
	files:number,
	folders:number,
	symlinks:number,
	ignoredEOL:number,
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
	
	public all:DetailStats = {
		total: 0,
		size: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		ignoredEOL: 0,
	};
	
	public conflicting:DetailStats = {
		total: 0,
		size: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		ignoredEOL: 0,
	};
	
	public deleted:DetailStats = {
		total: 0,
		size: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		ignoredEOL: 0,
	};
	
	public modified:DetailStats = {
		total: 0,
		size: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		ignoredEOL: 0,
	};
	
	public unchanged:DetailStats = {
		total: 0,
		size: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		ignoredEOL: 0,
	};
	
	public untracked:DetailStats = {
		total: 0,
		size: 0,
		files: 0,
		folders: 0,
		symlinks: 0,
		ignoredEOL: 0,
	};
	
	public constructor (private result:DiffResult) {
		
		this.createStats();
		
	}
	
	private createStats () :void {
		
		const result = this.result;
		
		this.pathA.pathname = result.pathA;
		this.pathB.pathname = result.pathB;
		
		result.diffs.forEach((diff:Diff) => {
			
			if (diff.fileA) countBasicStats(diff.fileA, this.pathA);
			if (diff.fileB) countBasicStats(diff.fileB, this.pathB);
			
			countDetailStats(diff, this.all);
			
			if (diff.status === 'conflicting') countDetailStats(diff, this.conflicting);
			else if (diff.status === 'deleted') countDetailStats(diff, this.deleted);
			else if (diff.status === 'modified') countDetailStats(diff, this.modified);
			else if (diff.status === 'unchanged') countDetailStats(diff, this.unchanged);
			else if (diff.status === 'untracked') countDetailStats(diff, this.untracked);
			
		});
		
	}
	
	public report () :string {
		
		const ignoreEndOfLine = vscode.workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false);
		let text = 'INFO';
		
		text += '\n\n';
		text += 'Compared:    ' + formatBasicStats(`${this.pathA.pathname} ↔ ${this.pathB.pathname}`, this.all);
		text += '\n\n';
		text += 'Left Path:   ' + formatBasicStats(this.pathA.pathname, this.pathA);
		text += '\n\n';
		text += 'Right Path:  ' + formatBasicStats(this.pathB.pathname, this.pathB);
		text += '\n\n\n';
		text += `RESULT

Comparisons: ${this.result.diffs.length}
Diffs:       ${this.result.diffs.length - this.unchanged.total}
Conflicts:   ${this.conflicting.total}
Created:     ${this.untracked.total}
Deleted:     ${this.deleted.total}
Modified:    ${this.modified.total}${ignoreEndOfLine ? formatIgnoreEOL(this.modified.ignoredEOL) : ''}
Unchanged:   ${this.unchanged.total}${ignoreEndOfLine ? formatIgnoreEOL(this.unchanged.ignoredEOL) : ''}`;
		
		return text;
		
	}
	
}

//	Functions __________________________________________________________________

function countBasicStats (file:File, stats:FolderStats) {
	
	stats.total++;
	stats.size += file.stat.size;
	
	if (file.type === 'file') stats.files++;
	if (file.type === 'folder') stats.folders++;
	if (file.type === 'symlink') stats.symlinks++;
	
}

function countDetailStats (diff:Diff, stats:DetailStats) {
	
	stats.total++;
	
	if (diff.fileA) stats.size += diff.fileA.stat.size;
	if (diff.fileB) stats.size += diff.fileB.stat.size;
	
	if (diff.type === 'file') stats.files++;
	if (diff.type === 'folder') stats.folders++;
	if (diff.type === 'symlink') stats.symlinks++;
	
	if (diff.ignoredEOL) stats.ignoredEOL++;
	
}

function formatFileSize (size:number) {
	
	if (size > PB) return `${(size / PB).toFixed(2)} PB`;
	if (size > TB) return `${(size / TB).toFixed(2)} TB`;
	if (size > GB) return `${(size / GB).toFixed(2)} GB`;
	if (size > MB) return `${(size / MB).toFixed(2)} MB`;
	if (size > KB) return `${(size / KB).toFixed(2)} KB`;
	
	return `${formatAmount(size, pluralBytes)}`;
	
}

function formatBasicStats (name:string, stats:DetailStats|FolderStats) {
	
	return `${name}
Items:       ${stats.total}${formatDetail(stats.files, stats.folders)}
Size:        ${formatFileSize(stats.size)}${formatBytes(stats.size)}`;
// Symlinks: ${stats.symlinks}`;
	
}

function formatAmount (value:number, measure:Plural) {
	
	return `${value} ${measure[value] || measure.size}`;
	
}

function formatDetail (files:number, folders:number) {
	
	return ` (${formatAmount(files, pluralFiles)}, ${formatAmount(folders, pluralFolders)})`;
	
}

function formatBytes (size:number) {
	
	return size > KB ? ` (${formatAmount(size, pluralBytes)})` : '';
	
}

function formatIgnoreEOL (files:number) {
	
	return ` (Ignored EOL in ${formatAmount(files, pluralFiles)})`;
	
}

function formatDetailStats () {
	
	
	
}