//	Imports ____________________________________________________________________

import { formatAmount, formatFileSize, formatList } from '../../@l13/formats';
import { pluralErrors, pluralFiles, pluralFolders, pluralOthers, pluralSymlinks } from '../../@l13/units/files';

import type { Diff, DiffFile, DiffSettings } from '../../types';

import { MODIFIED } from '../@l13/buffers';

import type { DiffResult } from './DiffResult';

import { DetailStats } from './stats/DetailStats';
import { FolderStats } from './stats/FolderStats';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffStats {
	
	public pathA: FolderStats = new FolderStats();
	
	public pathB: FolderStats = new FolderStats();
	
	public all: DetailStats = new DetailStats();
	
	public conflicting: DetailStats = new DetailStats();
	
	public deleted: DetailStats = new DetailStats();
	
	public modified: DetailStats = new DetailStats();
	
	public unchanged: DetailStats = new DetailStats();
	
	public untracked: DetailStats = new DetailStats();
	
	public ignored: DetailStats = new DetailStats();
	
	public constructor (private result: DiffResult) {
		
		this.createStats();
		
	}
	
	private createStats () {
		
		const result = this.result;
		
		this.pathA.pathname = result.pathA;
		this.pathB.pathname = result.pathB;
		
		result.diffs.forEach((diff: Diff) => {
			
			if (diff.fileA) countFileStats(this.pathA, diff.fileA);
			if (diff.fileB) countFileStats(this.pathB, diff.fileB);
			
			countAllStats(this.all, this.pathA, this.pathB);
			
			if (diff.status === 'conflicting') countDetailStats(this.conflicting, diff);
			else if (diff.status === 'deleted') countDetailStats(this.deleted, diff);
			else if (diff.status === 'modified') countDetailStats(this.modified, diff);
			else if (diff.status === 'unchanged') countDetailStats(this.unchanged, diff);
			else if (diff.status === 'untracked') countDetailStats(this.untracked, diff);
			else if (diff.status === 'ignored') countDetailStats(this.ignored, diff);
			
		});
		
	}
	
	public report () {
		
		const diffs = this.result.diffs;
		const settings = this.result.settings;
		const pathA = this.pathA;
		const pathB = this.pathB;
		
		return `${DiffStats.formatSettings(settings)}



INFO

Compared:    ${formatFileStats(`${pathA.pathname}" ↔ "${pathB.pathname}`, this.all)}

Left Path:   ${formatFileStats(pathA.pathname, pathA)}

Right Path:  ${formatFileStats(pathB.pathname, pathB)}



RESULT

Comparisons: ${diffs.length - this.ignored.total}
Diffs:       ${diffs.length - this.ignored.total - this.unchanged.total}
Conflicts:   ${this.conflicting.total}
Created:     ${formatTotal(this.untracked)}
Deleted:     ${formatTotal(this.deleted)}
Modified:    ${formatTotal(this.modified)}
Unchanged:   ${formatTotal(this.unchanged)}
Ignored:     ${formatEntries(this.ignored)}



UPDATES
`;
		
	}
	
	public static formatSettings (settings: DiffSettings) {
		
		return `SETTINGS

Abort on Error: ${settings.abortOnError}
Excludes: "${settings.excludes.join('", "')}"
Ignore Contents: ${settings.ignoreContents}
Ignore End of Line: ${settings.ignoreEndOfLine}
Ignore Byte Order Mark: ${settings.ignoreByteOrderMark}
Ignore Leading/Trailing Whitespace: ${settings.ignoreTrimWhitespace}
Max File Size: ${settings.maxFileSize ? `${settings.maxFileSize} MB` : '0'}
Use Case Sensitive: ${settings.useCaseSensitive}`;
		
	}
	
}

//	Functions __________________________________________________________________

function countFileStats (stats: DetailStats | FolderStats, file: DiffFile) {
	
	stats.entries++;
	
	if (file.stat) stats.size += file.stat.size;
	
	if (file.type === 'file') stats.files++;
	else if (file.type === 'folder') stats.folders++;
	else if (file.type === 'symlink') stats.symlinks++;
	else if (file.type === 'error') stats.errors++;
	else if (file.type === 'unknown') stats.others++;
	
}

function countAllStats (stats: DetailStats, pathA: FolderStats, pathB: FolderStats) {
	
	stats.entries = pathA.entries + pathB.entries;
	stats.size = pathA.size + pathB.size;
	stats.files = pathA.files + pathB.files;
	stats.folders = pathA.folders + pathB.folders;
	stats.symlinks = pathA.symlinks + pathB.symlinks;
	stats.errors = pathA.errors + pathB.errors;
	stats.others = pathA.others + pathB.others;
	
}

function countDetailStats (stats: DetailStats, diff: Diff) {
	
	stats.total++;
	
	if (diff.ignoredEOL) stats.ignoredEOL += diff.ignoredEOL === MODIFIED.BOTH ? 2 : 1;
	if (diff.ignoredBOM) stats.ignoredBOM += diff.ignoredBOM === MODIFIED.BOTH ? 2 : 1;
	if (diff.ignoredWhitespace) stats.ignoredWhitespace += diff.ignoredWhitespace === MODIFIED.BOTH ? 2 : 1;
	
	if (diff.fileA) countFileStats(stats, diff.fileA);
	if (diff.fileB) countFileStats(stats, diff.fileB);
	
}

function formatFileStats (name: string, stats: DetailStats | FolderStats) {
	
	return `"${name}"
Entries:     ${formatEntries(stats)}
Size:        ${formatFileSize(stats.size)}`;
	
}

function formatTotal (stats: DetailStats) {
	
	const ignored: string[] = [];
	
	if (stats.ignoredBOM) ignored.push(`BOM in ${formatAmount(stats.ignoredBOM, pluralFiles)}`);
	if (stats.ignoredEOL) ignored.push(`EOL in ${formatAmount(stats.ignoredEOL, pluralFiles)}`);
	if (stats.ignoredWhitespace) ignored.push(`Whitespace in ${formatAmount(stats.ignoredWhitespace, pluralFiles)}`);
	
	const info = ignored.length ? `, Ignored ${formatList(ignored)}` : '';
	const entries: string[] = formatDetails(stats);
	
	return entries.length ? `${stats.total} (${entries.join(', ')})${info}` : '0';
	
}

function formatEntries (stats: DetailStats | FolderStats) {
	
	const entries: string[] = formatDetails(stats);
	
	return entries.length > 1 ? `${stats.entries} (${entries.join(', ')})` : entries[0] || '0';
	
}

function formatDetails (stats: DetailStats | FolderStats) {
	
	const entries: string[] = [];
	
	if (stats.files) entries.push(`${formatAmount(stats.files, pluralFiles)}`);
	if (stats.folders) entries.push(`${formatAmount(stats.folders, pluralFolders)}`);
	if (stats.symlinks) entries.push(`${formatAmount(stats.symlinks, pluralSymlinks)}`);
	if (stats.errors) entries.push(`${formatAmount(stats.errors, pluralErrors)}`);
	if (stats.others) entries.push(`${formatAmount(stats.others, pluralOthers)}`);
	
	return entries;
	
}