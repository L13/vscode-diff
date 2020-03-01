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
const pluralSymlinks:Plural = { size: 'symlinks', 1: 'symlink' };
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
		
		return `INFO

Compared:    ${formatBasicStats(`${this.pathA.pathname} ↔ ${this.pathB.pathname}`, this.all)}

Left Path:   ${formatBasicStats(this.pathA.pathname, this.pathA)}

Right Path:  ${formatBasicStats(this.pathB.pathname, this.pathB)}


RESULT

Comparisons: ${this.result.diffs.length}
Diffs:       ${this.result.diffs.length - this.unchanged.total}
Conflicts:   ${this.conflicting.total}
Created:     ${formatDetail(this.untracked)}
Deleted:     ${formatDetail(this.deleted)}
Modified:    ${formatDetail(this.modified, ignoreEndOfLine)}
Unchanged:   ${formatDetail(this.unchanged, ignoreEndOfLine)}`;
		
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
	
	const bytes = formatAmount(size, pluralBytes);
	
	if (size > PB) return `${(size / PB).toFixed(2)} PB (${bytes})`;
	if (size > TB) return `${(size / TB).toFixed(2)} TB (${bytes})`;
	if (size > GB) return `${(size / GB).toFixed(2)} GB (${bytes})`;
	if (size > MB) return `${(size / MB).toFixed(2)} MB (${bytes})`;
	if (size > KB) return `${(size / KB).toFixed(2)} KB (${bytes})`;
	
	return bytes;
	
}

function formatBasicStats (name:string, stats:DetailStats|FolderStats) {
	
	return `${name}
Entries:     ${formatDetail(stats)}
Size:        ${formatFileSize(stats.size)}`;

}

function formatAmount (value:number, measure:Plural) {
	
	return `${value} ${measure[value] || measure.size}`;
	
}

function formatDetail (stats:DetailStats|FolderStats, ignoreEndOfLine:boolean = false) {
	
	const eol = ignoreEndOfLine ? `Ignored EOL in ${formatAmount(stats.files, pluralFiles)}` : '';
	const total:string[] = [];
	
	if (stats.files) total.push(`${formatAmount(stats.files, pluralFiles)}${eol ? ` [${eol}]` : ''}`);
	if (stats.folders) total.push(`${formatAmount(stats.folders, pluralFolders)}`);
	if (stats.symlinks) total.push(`${formatAmount(stats.symlinks, pluralSymlinks)}`);
	
	return total.length > 1 ? `${stats.total} (${total.join(', ')})` : total[0] || '0';
	
}