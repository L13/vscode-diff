//	Imports ____________________________________________________________________

import { constants } from 'buffer';
import * as fs from 'fs';
import { isAbsolute } from 'path';
import * as vscode from 'vscode';

import { normalizeLineEnding, trimWhitespace } from '../@l13/buffers';
import { lstatSync, sanitize, walkTree } from '../@l13/fse';

import { sortCaseInsensitive } from '../../@l13/arrays';
import { Dictionary, Diff, DiffError, DiffFile, DiffInitMessage, DiffSettings, StartEvent, StatsMap } from '../../types';

import * as dialogs from '../common/dialogs';
import { isTextFile } from '../common/extensions';
import * as settings from '../common/settings';

import { DiffResult } from '../output/DiffResult';

//	Variables __________________________________________________________________

const findPlaceholder = /^\$\{workspaceFolder(?:\:((?:\\\}|[^\}])*))?\}/;
const findEscapedEndingBrace = /\\\}/g;

const COMPARE_DONT_SHOW_AGAIN = 'Compare, don\'t show again';

const BUFFER_MAX_LENGTH = constants.MAX_LENGTH;
const MAX_CACHE_BUFFER_LENGTH = 33554432; // 32 MB

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCompare {
	
	private _onInitCompare:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onInitCompare:vscode.Event<undefined> = this._onInitCompare.event;
	
	private _onDidNotCompare:vscode.EventEmitter<DiffError> = new vscode.EventEmitter<DiffError>();
	public readonly onDidNotCompare:vscode.Event<DiffError> = this._onDidNotCompare.event;
	
	private _onStartCompareFiles:vscode.EventEmitter<StartEvent> = new vscode.EventEmitter<StartEvent>();
	public readonly onStartCompareFiles:vscode.Event<StartEvent> = this._onStartCompareFiles.event;
	
	private _onDidCompareFiles:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidCompareFiles:vscode.Event<DiffResult> = this._onDidCompareFiles.event;
	
	private _onStartCompareFolders:vscode.EventEmitter<StartEvent> = new vscode.EventEmitter<StartEvent>();
	public readonly onStartCompareFolders:vscode.Event<StartEvent> = this._onStartCompareFolders.event;
	
	private _onDidCompareFolders:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidCompareFolders:vscode.Event<DiffResult> = this._onDidCompareFolders.event;
	
	private _onDidUpdateDiff:vscode.EventEmitter<Diff> = new vscode.EventEmitter<Diff>();
	public readonly onDidUpdateDiff:vscode.Event<Diff> = this._onDidUpdateDiff.event;
	
	private _onDidUpdateAllDiffs:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidUpdateAllDiffs:vscode.Event<DiffResult> = this._onDidUpdateAllDiffs.event;
	
	private _onStartScanFolder:vscode.EventEmitter<string> = new vscode.EventEmitter<string>();
	public readonly onStartScanFolder:vscode.Event<string> = this._onStartScanFolder.event;
	
	private _onEndScanFolder:vscode.EventEmitter<StatsMap> = new vscode.EventEmitter<StatsMap>();
	public readonly onEndScanFolder:vscode.Event<StatsMap> = this._onEndScanFolder.event;
	
	public initCompare (data:DiffInitMessage) :void {
		
		this._onInitCompare.fire(undefined);
		
		let pathA = parsePredefinedVariable(data.pathA);
		let pathB = parsePredefinedVariable(data.pathB);
		
		if (!pathA) return this.onError(`The left path is empty.`, pathA, pathB);
		if (!pathB) return this.onError(`The right path is empty.`, pathA, pathB);
		
		pathA = sanitize(pathA);
		pathB = sanitize(pathB);
		
		if (!isAbsolute(pathA)) return this.onError(`The left path is not absolute.`, pathA, pathB);
		if (!isAbsolute(pathB)) return this.onError(`The right path is not absolute.`, pathA, pathB);
		
		pathA = vscode.Uri.file(pathA).fsPath;
		pathB = vscode.Uri.file(pathB).fsPath;
		
		if (pathA === pathB) return this.onError(`The left and right path is the same.`, pathA, pathB);
		
		const statA = lstatSync(pathA);
		if (!statA) return this.onError(`The left path "${pathA}" does not exist.`, pathA, pathB);
		
		const statB = lstatSync(pathB);
		if (!statB) return this.onError(`The right path "${pathB}" does not exist.`, pathA, pathB);
		
		if (statA.isFile() && statB.isFile()) this.compareFiles(data, pathA, pathB);
		else if (statA.isDirectory() && statB.isDirectory()) this.compareFolders(data, pathA, pathB);
		else this.onError(`The left and right path can't be compared!`, pathA, pathB);
		
	}
	
	public updateDiffs (data:DiffResult) :void {
		
		data.diffs.forEach((diff:Diff) => {
			
			diff.fileA.stat = lstatSync(diff.fileA.fsPath);
			diff.fileB.stat = lstatSync(diff.fileB.fsPath);
			
			compareDiff(diff, data.settings);
			
			this._onDidUpdateDiff.fire(diff);
			
		});
		
		this._onDidUpdateAllDiffs.fire(data);
		
	}
	
	private compareFiles (data:DiffInitMessage, pathA:string, pathB:string) {
		
		const left = vscode.Uri.file(pathA);
		const right = vscode.Uri.file(pathB);
		const openToSide = settings.get('openToSide', false);
		
		this._onStartCompareFiles.fire({ data, pathA, pathB });
		
		vscode.commands.executeCommand('vscode.diff', left, right, `${pathA} ↔ ${pathB}`, {
			preview: false,
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		});
		
		this._onDidCompareFiles.fire(new DiffResult(pathA, pathB, null));
		
	}
	
	private async compareFolders (data:DiffInitMessage, pathA:string, pathB:string) {
		
		this._onStartCompareFolders.fire({ data, pathA, pathB });
		
		try {
			this._onDidCompareFolders.fire(await this.createDiffs(pathA, pathB));
		} catch (error) {
			this.onError(error, pathA, pathB);
		}
		
	}
	
	private onError (error:string|Error, pathA:string, pathB:string) {
		
		vscode.window.showErrorMessage(`${error}`);
		
		this._onDidNotCompare.fire({ error, pathA, pathB });
		
	}
	
	public async scanFolder (dirname:string, { abortOnError, excludes, useCaseSensitive, maxFileSize }:DiffSettings) {
		
		this._onStartScanFolder.fire(dirname);
		
		const result = await walkTree(dirname, { abortOnError, excludes, useCaseSensitive, maxFileSize });
		
		this._onEndScanFolder.fire(result);
		
		return result;
		
	}
	
	private async createDiffs (dirnameA:string, dirnameB:string) :Promise<DiffResult> {
		
		const useCaseSensitiveFileName = settings.get('useCaseSensitiveFileName', 'detect');
		let useCaseSensitive = useCaseSensitiveFileName === 'detect' ? settings.hasCaseSensitiveFileSystem : useCaseSensitiveFileName === 'on';
		
		if (settings.hasCaseSensitiveFileSystem && !useCaseSensitive) {
			if (settings.get('confirmCaseInsensitiveCompare', true)) {
				const value = await dialogs.confirm(`The file system is case sensitive. Are you sure to compare case insensitive?`, 'Compare', COMPARE_DONT_SHOW_AGAIN);
				if (value) {
					if (value === COMPARE_DONT_SHOW_AGAIN) settings.update('confirmCaseInsensitiveCompare', false);
				} else useCaseSensitive = true;
			}
		}
		
		const diffSettings:DiffSettings = {
			abortOnError: settings.get('abortOnError', true),
			excludes: settings.getExcludes(dirnameA, dirnameB),
			ignoreContents: settings.get('ignoreContents', false),
			ignoreEndOfLine: settings.get('ignoreEndOfLine', false),
			ignoreTrimWhitespace: settings.ignoreTrimWhitespace(),
			maxFileSize: settings.maxFileSize(),
			useCaseSensitive,
		};
		const diffResult:DiffResult = new DiffResult(dirnameA, dirnameB, diffSettings);
		const resultA:StatsMap = await this.scanFolder(dirnameA, diffSettings);
		const resultB:StatsMap = await this.scanFolder(dirnameB, diffSettings);
		const diffs:Dictionary<Diff> = {};
		
		createListA(diffs, resultA, diffSettings);
		compareWithListB(diffs, resultB, diffSettings);
		diffResult.diffs = Object.keys(diffs).sort(sortCaseInsensitive).map((relative) => diffs[relative]);
		
		return diffResult;
		
	}

}

//	Functions __________________________________________________________________

function createListA (diffs:Dictionary<Diff>, result:StatsMap, diffSettings:DiffSettings) {
	
	const useCaseSensitive = diffSettings.useCaseSensitive;
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = useCaseSensitive ? file.name : file.name.toUpperCase();
		
		if (!diffs[id]) addFile(diffs, id, file, null);
		else throw new URIError(`File "${file.fsPath}" exists! Please enable case sensitive file names.`);

	});
	
}

function compareWithListB (diffs:Dictionary<Diff>, result:StatsMap, diffSettings:DiffSettings) {
	
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

function compareDiff (diff:Diff, { ignoreContents, ignoreEndOfLine, ignoreTrimWhitespace }:DiffSettings) {
	
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
		
	const sizeA = (<fs.Stats>fileA.stat).size;
	const sizeB = (<fs.Stats>fileB.stat).size;
	
	if (typeA === 'file') {
		
		if (ignoreContents) {
			if (sizeA !== sizeB) diff.status = 'modified';
		} else if ((ignoreEndOfLine || ignoreTrimWhitespace) &&
			isTextFile(fileA.basename) &&
			sizeA <= BUFFER_MAX_LENGTH &&
			sizeB <= BUFFER_MAX_LENGTH) {
				
			// if (sizeA === sizeB && sizeA > MAX_CACHE_BUFFER_LENGTH && hasSameContents(fileA.fsPath, fileB.fsPath)) return;
				
			let bufferA = fs.readFileSync(fileA.fsPath);
			let bufferB = fs.readFileSync(fileB.fsPath);
			
		//	If files are equal normalizing is not necessary
			if (sizeA === sizeB && bufferA.equals(bufferB)) return;
			
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
			
		} else {
			
			if (sizeA === sizeB) {
				if (sizeA <= MAX_CACHE_BUFFER_LENGTH) {
					const bufferA = fs.readFileSync(fileA.fsPath);
					const bufferB = fs.readFileSync(fileB.fsPath);
					if (!bufferA.equals(bufferB)) diff.status = 'modified';
				} else if (!hasSameContents(fileA.fsPath, fileB.fsPath)) diff.status = 'modified';
			} else diff.status = 'modified';
			
		}
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

function parsePredefinedVariable (pathname:string) {
	
	// tslint:disable-next-line: only-arrow-functions
	return pathname.replace(findPlaceholder, function (match, name) {
		
		const workspaceFolders = vscode.workspace.workspaceFolders;
		
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder available!');
			return match;
		}
		
		if (!name) return workspaceFolders[0].uri.fsPath;
		
		name = name.replace(findEscapedEndingBrace, '}');
		
		for (const workspaceFolder of workspaceFolders) {
			if (workspaceFolder.name === name) return workspaceFolder.uri.fsPath;
		}
		
		vscode.window.showErrorMessage(`No workspace folder with name "${name}" available!`);
		
		return match;
		
	});
	
}

function addFile (diffs:Dictionary<Diff>, id:string, fileA:DiffFile, fileB:DiffFile) {
	
	const file = fileA || fileB;
	
	diffs[id] = {
		id,
		status: file.ignore ? 'ignored' : fileA ? 'deleted' : 'untracked',
		type: file.type,
		ignoredEOL: false,
		ignoredWhitespace: false,
		fileA,
		fileB,
	};
	
}

function hasSameContents (pathA:string, pathB:string) {
	
	let fdA;
	let fdB;
	
	try {
		fdA = fs.openSync(pathA, 'r');
		fdB = fs.openSync(pathB, 'r');
		
		const bufferA = Buffer.alloc(MAX_CACHE_BUFFER_LENGTH);
		const bufferB = Buffer.alloc(MAX_CACHE_BUFFER_LENGTH);
		
		while (true) {
			const sizeA = fs.readSync(fdA, bufferA, 0, MAX_CACHE_BUFFER_LENGTH, null);
			if (!sizeA) break;
			
			const sizeB = fs.readSync(fdB, bufferB, 0, MAX_CACHE_BUFFER_LENGTH, null);
			if (!sizeB) break;
			
			if (!bufferA.equals(bufferB)) return false;
			
			if (sizeA < MAX_CACHE_BUFFER_LENGTH || sizeB < MAX_CACHE_BUFFER_LENGTH) break;
		}
		return true;
	} catch (error) {
		throw error;
	} finally {
		if (fdA) fs.closeSync(fdA);
		if (fdB) fs.closeSync(fdB);
	}
	
}