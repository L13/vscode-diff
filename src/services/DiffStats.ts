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

type Plural = {
	size:string,
	[index:number]:string,
};

//	Initialize _________________________________________________________________

class FolderStats {
	public pathname:string = '';
	public total:number = 0;
	public files:number = 0;
	public folders:number = 0;
	public symlinks:number = 0;
	public size:number = 0;
}

// tslint:disable-next-line: max-classes-per-file
class DetailStats {
	public total:number = 0;
	public files:number = 0;
	public folders:number = 0;
	public symlinks:number = 0;
	public size:number = 0;
	public ignoredEOL:number = 0;
}

//	Exports ____________________________________________________________________

// tslint:disable-next-line: max-classes-per-file
export class DiffStats {
	
	public pathA:FolderStats = new FolderStats();
	
	public pathB:FolderStats = new FolderStats();
	
	public all:DetailStats = new DetailStats();
	
	public conflicting:DetailStats = new DetailStats();
	
	public deleted:DetailStats = new DetailStats();
	
	public modified:DetailStats = new DetailStats();
	
	public unchanged:DetailStats = new DetailStats();
	
	public untracked:DetailStats = new DetailStats();
	
	public constructor (private result:DiffResult) {
		
		this.createStats();
		
	}
	
	private createStats () :void {
		
		const result = this.result;
		
		this.pathA.pathname = result.pathA;
		this.pathB.pathname = result.pathB;
		
		result.diffs.forEach((diff:Diff) => {
			
			if (diff.fileA) countBasicStats(this.pathA, diff.fileA);
			if (diff.fileB) countBasicStats(this.pathB, diff.fileB);
			
			countAllStats(this.all, this.pathA, this.pathB);
			
			if (diff.status === 'conflicting') countDetailStats(this.conflicting, diff);
			else if (diff.status === 'deleted') countDetailStats(this.deleted, diff);
			else if (diff.status === 'modified') countDetailStats(this.modified, diff);
			else if (diff.status === 'unchanged') countDetailStats(this.unchanged, diff);
			else if (diff.status === 'untracked') countDetailStats(this.untracked, diff);
			
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

function countBasicStats (stats:FolderStats, file:File) {
	
	stats.total++;
	stats.size += file.stat.size;
	
	if (file.type === 'file') stats.files++;
	else if (file.type === 'folder') stats.folders++;
	else if (file.type === 'symlink') stats.symlinks++;
	
}

function countAllStats (stats:DetailStats, pathA:FolderStats, pathB:FolderStats) {
	
	stats.total = pathA.total + pathB.total;
	stats.size = pathA.size + pathB.size;
	stats.files = pathA.files + pathB.files;
	stats.folders = pathA.folders + pathB.folders;
	stats.symlinks = pathA.symlinks + pathB.symlinks;
	
}

function countDetailStats (stats:DetailStats, diff:Diff) {
	
	stats.total++;
	
	if (diff.fileA) stats.size += diff.fileA.stat.size;
	if (diff.fileB) stats.size += diff.fileB.stat.size;
	
	if (diff.type === 'file') {
		stats.files++;
		if (diff.ignoredEOL) stats.ignoredEOL++;
	} else if (diff.type === 'folder') stats.folders++;
	else if (diff.type === 'symlink') stats.symlinks++;
	
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
Entries:     ${stats.total}${formatDetail(stats.files, stats.folders)}
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