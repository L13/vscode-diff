//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { isAbsolute } from 'path';
import * as vscode from 'vscode';

import { normalizeLineEnding, trimWhitespace } from '../@l13/buffers';
import { lstatSync, walkTree } from '../@l13/fse';

import { sortCaseInsensitive } from '../../@l13/arrays';
import { Dictionary, Diff, DiffFile, DiffInitMessage, StartEvent, StatsMap } from '../../types';

import * as dialogs from '../../common/dialogs';
import { textfiles } from '../../common/extensions';
import * as settings from '../../common/settings';

import { DiffResult } from '../output/DiffResult';

//	Variables __________________________________________________________________

const findPlaceholder = /^\$\{workspaceFolder(?:\:((?:\\\}|[^\}])*))?\}/;
const findEscapedEndingBrace = /\\\}/g;

const COMPARE_DONT_SHOW_AGAIN = 'Compare, don\'t show again';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffCompare {
	
	private _onInitCompare:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onInitCompare:vscode.Event<undefined> = this._onInitCompare.event;
	
	private _onDidNotCompare:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidNotCompare:vscode.Event<DiffResult> = this._onDidNotCompare.event;
	
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
		
		const ignoreEndOfLine = settings.get('ignoreEndOfLine', false);
		const ignoreTrimWhitespace = settings.ignoreTrimWhitespace();
		
		data.diffs.forEach((diff:Diff) => {
			
			diff.fileA.stat = lstatSync(diff.fileA.fsPath);
			diff.fileB.stat = lstatSync(diff.fileB.fsPath);
			
			compareDiff(diff, diff.fileA, diff.fileB, ignoreEndOfLine, ignoreTrimWhitespace);
			
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
		
		this._onDidCompareFiles.fire(new DiffResult(pathA, pathB));
		
	}
	
	private async compareFolders (data:DiffInitMessage, pathA:string, pathB:string) {
		
		this._onStartCompareFolders.fire({ data, pathA, pathB });
		
		try {
			this._onDidCompareFolders.fire(await this.createDiffs(pathA, pathB));
		} catch (error) {
			this.onError(error.message, pathA, pathB);
		}
		
	}
	
	
	private onError (text:string, pathA:string, pathB:string) {
		
		vscode.window.showErrorMessage(text);
		
		this._onDidNotCompare.fire(new DiffResult(pathA, pathB));
		
	}
	
	public async scanFolder (dirname:string, excludes:string[], useCaseSensitive:boolean) {
		
		this._onStartScanFolder.fire(dirname);
		
		let result:StatsMap = {};
		
		try {
			result = await walkTree(dirname, { excludes, useCaseSensitive });
		} catch (error) {
			vscode.window.showErrorMessage(error.message);
		}
		
		this._onEndScanFolder.fire(result);
		
		return result;
		
	}
	
	private async createDiffs (dirnameA:string, dirnameB:string) :Promise<DiffResult> {
		
		const exludes = settings.getExcludes(dirnameA, dirnameB);
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
		
		const resultA:StatsMap = await this.scanFolder(dirnameA, exludes, useCaseSensitive);
		const resultB:StatsMap = await this.scanFolder(dirnameB, exludes, useCaseSensitive);
		const diffResult:DiffResult = new DiffResult(dirnameA, dirnameB);
		const diffs:Dictionary<Diff> = {};
		
		createListA(diffs, resultA, useCaseSensitive);
		compareWithListB(diffs, resultB, useCaseSensitive);
		diffResult.diffs = Object.keys(diffs).sort(sortCaseInsensitive).map((relative) => diffs[relative]);
		
		return diffResult;
		
	}

}

//	Functions __________________________________________________________________

function createListA (diffs:Dictionary<Diff>, result:StatsMap, useCaseSensitive:boolean) {
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = useCaseSensitive ? file.relative : file.relative.toUpperCase();
		
		if (!diffs[id]) {
			diffs[id] = {
				id,
				status: file.ignore ? 'ignored' : 'deleted',
				type: file.type,
				ignoredEOL: false,
				ignoredWhitespace: false,
				fileA: file,
				fileB: null,
			};
		} else throw new URIError(`File "${file.fsPath}" exists! Please enable case sensitive file names.`);
		
	});
	
}

function compareWithListB (diffs:Dictionary<Diff>, result:StatsMap, useCaseSensitive:boolean) {
	
	const ignoreEndOfLine = settings.get('ignoreEndOfLine', false);
	const ignoreTrimWhitespace = settings.ignoreTrimWhitespace();
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = useCaseSensitive ? file.relative : file.relative.toUpperCase();
		const diff = diffs[id];
		
		if (!diff) {
			diffs[id] = {
				id,
				status: file.ignore ? 'ignored' : 'untracked',
				type: file.type,
				ignoredEOL: false,
				ignoredWhitespace: false,
				fileA: null,
				fileB: file,
			};
		} else {
			if (!diff.fileB) compareDiff(diff, <DiffFile>diff.fileA, diff.fileB = file, ignoreEndOfLine, ignoreTrimWhitespace);
			else throw new URIError(`File "${file.fsPath}" exists! Please enable case sensitive file names.`);
		}
		
	});
	
}

function compareDiff (diff:Diff, fileA:DiffFile, fileB:DiffFile, ignoreEndOfLine:boolean, ignoreTrimWhitespace:boolean) {
	
	const statA = <fs.Stats>fileA.stat;
	const statB = <fs.Stats>fileB.stat;
	
	if (diff.status === 'ignored') {
		if (fileA.type !== fileB.type) diff.type = 'mixed';
		return;
	}
	
	diff.status = 'unchanged';
	
	if (fileA.type !== fileB.type) {
		diff.status = 'conflicting';
		diff.type = 'mixed';
	} else if (fileA.type === 'file' && fileB.type === 'file') {
		if ((ignoreEndOfLine || ignoreTrimWhitespace) &&
			(textfiles.extensions.includes(fileA.extname) ||
			textfiles.filenames.includes(fileA.basename) ||
			textfiles.glob && textfiles.glob.test(fileA.basename))) {
			let bufferA = fs.readFileSync(fileA.fsPath);
			let bufferB = fs.readFileSync(fileB.fsPath);
		//	If files are equal normalizing is not necessary
			if (statA.size === statB.size && bufferA.equals(bufferB)) return;
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
			if (statA.size !== statB.size) {
				diff.status = 'modified';
			} else {
				const bufferA = fs.readFileSync(fileA.fsPath);
				const bufferB = fs.readFileSync(fileB.fsPath);
				if (!bufferA.equals(bufferB)) diff.status = 'modified';
			}
		}
	} else if (fileA.type === 'symlink' && fileB.type === 'symlink') {
		const linkA = fs.readlinkSync(fileA.fsPath);
		const linkB = fs.readlinkSync(fileB.fsPath);
		if (linkA !== linkB) diff.status = 'modified';
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