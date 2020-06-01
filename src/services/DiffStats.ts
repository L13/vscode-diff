//	Imports ____________________________________________________________________

import { formatAmount, formatFileSize } from './@l13/formats';

import { Diff, File, Plural } from '../types';
import { DiffResult } from './DiffResult';

import { DetailStats } from './stats/DetailStats';
import { FolderStats } from './stats/FolderStats';

//	Variables __________________________________________________________________

const pluralFiles:Plural = { size: 'files', 1: 'file' };
const pluralFolders:Plural = { size: 'folders', 1: 'folder' };
const pluralSymlinks:Plural = { size: 'symlinks', 1: 'symlink' };

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

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
Modified:    ${formatDetail(this.modified)}
Unchanged:   ${formatDetail(this.unchanged)}`;
		
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
		if (diff.ignoredWhitespace) stats.ignoredWhitespace++;
	} else if (diff.type === 'folder') stats.folders++;
	else if (diff.type === 'symlink') stats.symlinks++;
	
}

function formatBasicStats (name:string, stats:DetailStats|FolderStats) {
	
	return `${name}
Entries:     ${formatDetail(stats)}
Size:        ${formatFileSize(stats.size)}`;
	
}

function formatDetail (stats:DetailStats|FolderStats) {
	
	const ignored:string[] = [];
	
	if ((<DetailStats>stats).ignoredEOL) ignored.push('eol');
	if ((<DetailStats>stats).ignoredWhitespace) ignored.push('whitespace');
	
	const info = ignored.length ? ` [Ignored ${ignored.join(' and ')} in ${formatAmount(stats.files, pluralFiles)}]` : '';
	const total:string[] = [];
	
	if (stats.files) total.push(`${formatAmount(stats.files, pluralFiles)}${info}`);
	if (stats.folders) total.push(`${formatAmount(stats.folders, pluralFolders)}`);
	if (stats.symlinks) total.push(`${formatAmount(stats.symlinks, pluralSymlinks)}`);
	
	return total.length > 1 ? `${stats.total} (${total.join(', ')})` : total[0] || '0';
	
}