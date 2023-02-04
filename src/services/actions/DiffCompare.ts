//	Imports ____________________________________________________________________

import { constants } from 'buffer';
import * as fs from 'fs';
import { isAbsolute } from 'path';
import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/arrays';
import { normalizeLineEnding, removeUTF8BOM, trimWhitespace } from '../@l13/buffers';
import { lstatSync, sanitize, walkTree } from '../@l13/fse';

import type {
	Dictionary,
	Diff,
	DiffError,
	DiffFile,
	DiffInitMessage,
	DiffSettings,
	StartEvent,
	StatsMap,
} from '../../types';

import * as dialogs from '../common/dialogs';
import { isTextFile } from '../common/extensions';
import { parsePredefinedVariable } from '../common/paths';
import * as settings from '../common/settings';

import { DiffOutput } from '../output/DiffOutput';
import { DiffResult } from '../output/DiffResult';

//	Variables __________________________________________________________________

const BUFFER_MAX_LENGTH = constants.MAX_LENGTH;
const MAX_CACHE_BUFFER_LENGTH = 33554432; // 32 MB

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCompare {
	
	private _onWillCompare: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onWillCompare: vscode.Event<undefined> = this._onWillCompare.event;
	
	private _onDidNotCompare: vscode.EventEmitter<DiffError> = new vscode.EventEmitter<DiffError>();
	public readonly onDidNotCompare: vscode.Event<DiffError> = this._onDidNotCompare.event;
	
	private _onWillCompareFiles: vscode.EventEmitter<StartEvent> = new vscode.EventEmitter<StartEvent>();
	public readonly onWillCompareFiles: vscode.Event<StartEvent> = this._onWillCompareFiles.event;
	
	private _onDidCompareFiles: vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidCompareFiles: vscode.Event<DiffResult> = this._onDidCompareFiles.event;
	
	private _onWillCompareFolders: vscode.EventEmitter<StartEvent> = new vscode.EventEmitter<StartEvent>();
	public readonly onWillCompareFolders: vscode.Event<StartEvent> = this._onWillCompareFolders.event;
	
	private _onDidCompareFolders: vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidCompareFolders: vscode.Event<DiffResult> = this._onDidCompareFolders.event;
	
	private _onDidUpdateDiff: vscode.EventEmitter<Diff> = new vscode.EventEmitter<Diff>();
	public readonly onDidUpdateDiff: vscode.Event<Diff> = this._onDidUpdateDiff.event;
	
	private _onDidUpdateAllDiffs: vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidUpdateAllDiffs: vscode.Event<DiffResult> = this._onDidUpdateAllDiffs.event;
	
	private _onWillScanFolder: vscode.EventEmitter<string> = new vscode.EventEmitter<string>();
	public readonly onWillScanFolder: vscode.Event<string> = this._onWillScanFolder.event;
	
	private _onDidScanFolder: vscode.EventEmitter<StatsMap> = new vscode.EventEmitter<StatsMap>();
	public readonly onDidScanFolder: vscode.Event<StatsMap> = this._onDidScanFolder.event;
	
	public initCompare (data: DiffInitMessage) {
		
		this._onWillCompare.fire(undefined);
		
		let pathA = parsePredefinedVariable(data.pathA);
		let pathB = parsePredefinedVariable(data.pathB);
		
		if (!pathA) return this.onError('The left path is empty.', pathA, pathB);
		if (!pathB) return this.onError('The right path is empty.', pathA, pathB);
		
		pathA = sanitize(pathA);
		pathB = sanitize(pathB);
		
		if (!isAbsolute(pathA)) return this.onError('The left path is not absolute.', pathA, pathB);
		if (!isAbsolute(pathB)) return this.onError('The right path is not absolute.', pathA, pathB);
		
		pathA = vscode.Uri.file(pathA).fsPath;
		pathB = vscode.Uri.file(pathB).fsPath;
		
		if (pathA === pathB) return this.onError('The left and right path is the same.', pathA, pathB);
		
		const statA = lstatSync(pathA);
		if (!statA) return this.onError(`The left path "${pathA}" does not exist.`, pathA, pathB);
		
		const statB = lstatSync(pathB);
		if (!statB) return this.onError(`The right path "${pathB}" does not exist.`, pathA, pathB);
		
		if (statA.isFile() && statB.isFile()) this.compareFiles(data, pathA, pathB);
		else if (statA.isDirectory() && statB.isDirectory()) this.compareFolders(data, pathA, pathB);
		else this.onError('The left and right path can\'t be compared!', pathA, pathB);
		
	}
	
	public updateDiffs (data: DiffResult) {
		
		data.diffs.forEach((diff: Diff) => {
			
			diff.fileA.stat = lstatSync(diff.fileA.fsPath);
			diff.fileB.stat = lstatSync(diff.fileB.fsPath);
			
			compareDiff(diff, data.settings);
			
			this._onDidUpdateDiff.fire(diff);
			
		});
		
		this._onDidUpdateAllDiffs.fire(data);
		
	}
	
	private compareFiles (data: DiffInitMessage, pathA: string, pathB: string) {
		
		const left = vscode.Uri.file(pathA);
		const right = vscode.Uri.file(pathB);
		const openToSide = settings.get('openToSide', false);
		
		this._onWillCompareFiles.fire({ data, pathA, pathB });
		
		vscode.commands.executeCommand('vscode.diff', left, right, `${pathA} ↔ ${pathB}`, {
			preview: false,
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		});
		
		this._onDidCompareFiles.fire(new DiffResult(pathA, pathB, null));
		
	}
	
	private async compareFolders (data: DiffInitMessage, pathA: string, pathB: string) {
		
		this._onWillCompareFolders.fire({ data, pathA, pathB });
		
		const diffSettings = await getDiffSettings(pathA, pathB);
		
		try {
			const diffResult = await this.createDiffs(pathA, pathB, diffSettings);
			this._onDidCompareFolders.fire(diffResult);
		} catch (error) {
			this.onError(error, pathA, pathB, diffSettings);
		}
		
	}
	
	private onError (error: string | Error, pathA: string, pathB: string, diffSettings?: DiffSettings) {
		
		const buttons = [];
		
		if (diffSettings) buttons.push('Show Output');
		
		vscode.window.showErrorMessage(`${error}`, ...buttons).then((value) => {
			
			if (value) DiffOutput.currentOutput?.show();
			
		});
		
		this._onDidNotCompare.fire({ diffSettings, error, pathA, pathB });
		
	}
	
	public async scanFolder (dirname: string, { abortOnError, excludes, useCaseSensitive, maxFileSize }: DiffSettings) {
		
		this._onWillScanFolder.fire(dirname);
		
		const result = await walkTree(dirname, { abortOnError, excludes, useCaseSensitive, maxFileSize });
		
		this._onDidScanFolder.fire(result);
		
		return result;
		
	}
	
	private async createDiffs (dirnameA: string, dirnameB: string, diffSettings: DiffSettings): Promise<DiffResult> {
		
		const diffResult: DiffResult = new DiffResult(dirnameA, dirnameB, diffSettings);
		const resultA: StatsMap = await this.scanFolder(dirnameA, diffSettings);
		const resultB: StatsMap = await this.scanFolder(dirnameB, diffSettings);
		const diffs: Dictionary<Diff> = {};
		
		createListA(diffs, resultA, diffSettings);
		compareWithListB(diffs, resultB, diffSettings);
		diffResult.diffs = Object.keys(diffs).sort(sortCaseInsensitive).map((relative) => diffs[relative]);
		
		return diffResult;
		
	}

}

//	Functions __________________________________________________________________

async function getDiffSettings (dirnameA: string, dirnameB: string): Promise<DiffSettings> {
	
	const useCaseSensitiveFileName = settings.get('useCaseSensitiveFileName', 'detect');
	let useCaseSensitive = useCaseSensitiveFileName === 'detect' ? settings.hasCaseSensitiveFileSystem : useCaseSensitiveFileName === 'on';
	
	if (settings.hasCaseSensitiveFileSystem && !useCaseSensitive) {
		if (settings.get('confirmCaseInsensitiveCompare', true)) {
			const buttonCompareDontShowAgain = 'Compare, don\'t show again';
			const text = 'The file system is case sensitive. Are you sure to compare case insensitive?';
			const value = await dialogs.confirm(text, 'Compare', buttonCompareDontShowAgain);
			if (value) {
				if (value === buttonCompareDontShowAgain) settings.update('confirmCaseInsensitiveCompare', false);
			} else useCaseSensitive = true;
		}
	}
	
	return {
		abortOnError: settings.get('abortOnError', true),
		excludes: settings.getExcludes(dirnameA, dirnameB),
		ignoreContents: settings.get('ignoreContents', false),
		ignoreEndOfLine: settings.get('ignoreEndOfLine', false),
		ignoreUTF8BOM: settings.get('ignoreUTF8BOM', false),
		ignoreTrimWhitespace: settings.ignoreTrimWhitespace(),
		maxFileSize: settings.maxFileSize(),
		useCaseSensitive,
	};
	
}

function createListA (diffs: Dictionary<Diff>, result: StatsMap, diffSettings: DiffSettings) {
	
	const useCaseSensitive = diffSettings.useCaseSensitive;
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = useCaseSensitive ? file.name : file.name.toUpperCase();
		
		if (!diffs[id]) addFile(diffs, id, file, null);
		else throw new URIError(`File "${file.fsPath}" exists! Please enable case sensitive file names.`);

	});
	
}

function compareWithListB (diffs: Dictionary<Diff>, result: StatsMap, diffSettings: DiffSettings) {
	
	const useCaseSensitive = diffSettings.useCaseSensitive;
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = useCaseSensitive ? file.name : file.name.toUpperCase();
		const diff = diffs[id];
		
		if (diff) {
			if (!diff.fileB) {
				diff.fileB = file;
				if (file.ignore) diff.status = 'ignored';
				compareDiff(diff, diffSettings);
			} else throw new URIError(`File "${file.fsPath}" exists! Please enable case sensitive file names.`);
		} else addFile(diffs, id, null, file);
		
	});
	
}

function compareDiff (diff: Diff, { ignoreContents, ignoreEndOfLine, ignoreTrimWhitespace, ignoreUTF8BOM }: DiffSettings) {
	
	const fileA = diff.fileA;
	const fileB = diff.fileB;
	const typeA = fileA.type;
	
	if (typeA !== fileB.type) {
		diff.type = 'mixed';
		if (diff.status === 'ignored') return;
		diff.status = 'conflicting';
		return;
	} else if (diff.status === 'ignored') return;
	
	diff.status = 'unchanged';
		
	const sizeA = fileA.stat.size;
	const sizeB = fileB.stat.size;
	
	if (typeA === 'file') {
		if (ignoreContents) {
			if (sizeA !== sizeB) diff.status = 'modified';
		} else if ((ignoreEndOfLine || ignoreTrimWhitespace || ignoreUTF8BOM)
			&& isTextFile(fileA.basename)
			&& sizeA <= BUFFER_MAX_LENGTH
			&& sizeB <= BUFFER_MAX_LENGTH) {
			// if (sizeA === sizeB && sizeA > MAX_CACHE_BUFFER_LENGTH && hasSameContents(fileA.fsPath, fileB.fsPath)) return;
				
			let bufferA = fs.readFileSync(fileA.fsPath);
			let bufferB = fs.readFileSync(fileB.fsPath);
			
			//	If files are equal normalizing is not necessary
			if (sizeA === sizeB && bufferA.equals(bufferB)) return;
			
			if (ignoreUTF8BOM) {
				bufferA = removeUTF8BOM(bufferA);
				bufferB = removeUTF8BOM(bufferB);
				diff.ignoredUTF8BOM = true;
			}
			
			if (ignoreTrimWhitespace) {
				bufferA = trimWhitespace(bufferA);
				bufferB = trimWhitespace(bufferB);
				diff.ignoredWhitespace = true;
			}
			
			if (ignoreEndOfLine) {
				bufferA = normalizeLineEnding(bufferA);
				bufferB = normalizeLineEnding(bufferB);
				diff.ignoredEOL = true;
			}
			
			if (!bufferA.equals(bufferB)) diff.status = 'modified';
		} else if (sizeA === sizeB) {
			if (sizeA <= MAX_CACHE_BUFFER_LENGTH) {
				const bufferA = fs.readFileSync(fileA.fsPath);
				const bufferB = fs.readFileSync(fileB.fsPath);
				if (!bufferA.equals(bufferB)) diff.status = 'modified';
			} else if (!hasSameContents(fileA.fsPath, fileB.fsPath)) diff.status = 'modified';
		} else diff.status = 'modified';
	} else if (typeA === 'symlink') {
		if (sizeA === sizeB) {
			if (!ignoreContents) {
				const linkA = fs.readlinkSync(fileA.fsPath);
				const linkB = fs.readlinkSync(fileB.fsPath);
				if (linkA !== linkB) diff.status = 'modified';
			}
		} else diff.status = 'modified';
	}
	
}

function addFile (diffs: Dictionary<Diff>, id: string, fileA: DiffFile, fileB: DiffFile) {
	
	const file = fileA || fileB;
	
	diffs[id] = {
		id,
		status: file.ignore ? 'ignored' : fileA ? 'deleted' : 'untracked',
		type: file.type,
		ignoredEOL: false,
		ignoredUTF8BOM: false,
		ignoredWhitespace: false,
		fileA,
		fileB,
	};
	
}

function hasSameContents (pathA: string, pathB: string) {
	
	let fdA;
	let fdB;
	
	try {
		fdA = fs.openSync(pathA, 'r');
		fdB = fs.openSync(pathB, 'r');
		
		const bufferA = Buffer.alloc(MAX_CACHE_BUFFER_LENGTH);
		const bufferB = Buffer.alloc(MAX_CACHE_BUFFER_LENGTH);
		
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const sizeA = fs.readSync(fdA, bufferA, 0, MAX_CACHE_BUFFER_LENGTH, null);
			if (!sizeA) break;
			
			const sizeB = fs.readSync(fdB, bufferB, 0, MAX_CACHE_BUFFER_LENGTH, null);
			if (!sizeB) break;
			
			if (!bufferA.equals(bufferB)) return false;
			
			if (sizeA < MAX_CACHE_BUFFER_LENGTH || sizeB < MAX_CACHE_BUFFER_LENGTH) break;
		}
		return true;
	// eslint-disable-next-line no-useless-catch
	} catch (error) {
		throw error;
	} finally {
		if (fdA) fs.closeSync(fdA);
		if (fdB) fs.closeSync(fdB);
	}
	
}