//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { isAbsolute } from 'path';
import * as vscode from 'vscode';

import { normalizeLineEnding, trimWhitespace } from '../@l13/nodes/buffers';
import { lstatSync, walkTree } from '../@l13/nodes/fse';

import { sortCaseInsensitive } from '../../@l13/natvies/arrays';
import { Dictionary, Diff, DiffFile, DiffInitMessage, StartEvent, StatsMap } from '../../types';

import { DiffSettings, textfiles } from '../common/DiffSettings';
import { DiffResult } from '../output/DiffResult';

//	Variables __________________________________________________________________

const findPlaceholder = /^\$\{([a-zA-Z]+)(?:\:((?:\\\}|[^\}])*))?\}/;
const findEscapedEndingBrace = /\\\}/g;

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
		
		this._onInitCompare.fire();
		
		let pathA = parsePredefinedVariables(data.pathA);
		let pathB = parsePredefinedVariables(data.pathB);
		
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
		
		const ignoreEndOfLine = DiffSettings.get('ignoreEndOfLine', false);
		const ignoreTrimWhitespace = DiffSettings.ignoreTrimWhitespace();
		
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
		const openToSide = DiffSettings.get('openToSide', false);
		
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
	
	public async scanFolder (dirname:string, ignore:string[]) :Promise<StatsMap> {
		
		return new Promise((resolve, reject) => {
			
			this._onStartScanFolder.fire(dirname);
			
			walkTree(dirname, { ignore }, (error, result) => {
				
				if (error) return reject(error);
				
				this._onEndScanFolder.fire(result);
				
				resolve(result);
				
			});
			
		});
		
	}
	
	private async createDiffs (dirnameA:string, dirnameB:string) :Promise<DiffResult> {
		
		const ignore = DiffSettings.getIgnore(dirnameA, dirnameB);
		const resultA:StatsMap = await this.scanFolder(dirnameA, ignore);
		const resultB:StatsMap = await this.scanFolder(dirnameB, ignore);
		const diffs:Dictionary<Diff> = {};
		
		createListA(diffs, resultA);
		compareWithListB(diffs, resultB);
		
		const diffResult:DiffResult = new DiffResult(dirnameA, dirnameB);
		
		diffResult.diffs = Object.keys(diffs).sort(sortCaseInsensitive).map((relative) => diffs[relative]);
		
		return diffResult;
		
	}

}

//	Functions __________________________________________________________________

function createListA (diffs:Dictionary<Diff>, result:StatsMap) {
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = file.relative;
		
		diffs[id] = {
			id,
			status: 'deleted',
			type: file.type,
			ignoredEOL: false,
			ignoredWhitespace: false,
			fileA: file,
			fileB: null,
		};
		
	});
	
}

function compareWithListB (diffs:Dictionary<Diff>, result:StatsMap) {
	
	const ignoreEndOfLine = DiffSettings.get('ignoreEndOfLine', false);
	const ignoreTrimWhitespace = DiffSettings.ignoreTrimWhitespace();
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		const id = file.relative;
		const diff = diffs[id];
		
		if (!diff) {
			diffs[id] = {
				id,
				status: 'untracked',
				type: file.type,
				ignoredEOL: false,
				ignoredWhitespace: false,
				fileA: null,
				fileB: file,
			};
		} else compareDiff(diff, <DiffFile>diff.fileA, diff.fileB = file, ignoreEndOfLine, ignoreTrimWhitespace);
		
	});
	
}

function compareDiff (diff:Diff, fileA:DiffFile, fileB:DiffFile, ignoreEndOfLine:boolean, ignoreTrimWhitespace:boolean) {
	
	diff.status = 'unchanged';
	
	const statA = <fs.Stats>fileA.stat;
	const statB = <fs.Stats>fileB.stat;
	
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

function parsePredefinedVariables (pathname:string) {
	
	// tslint:disable-next-line: only-arrow-functions
	return pathname.replace(findPlaceholder, function (match, placeholder, value) {
		
		const workspaceFolders = vscode.workspace.workspaceFolders;
		
		switch (placeholder) {
			case 'workspaceFolder':
				if (!workspaceFolders) {
					vscode.window.showErrorMessage('No workspace folder available!');
					return match;
				}
				value = parseInt(value, 10);
				if (value && !(value < workspaceFolders.length)) {
					vscode.window.showErrorMessage(`No workspace folder with index ${value} available!`);
					return match;
				}
				value = value || 0;
				return workspaceFolders.filter(({ index }) => index === value)[0].uri.fsPath;
			case 'workspaceFolderBasename':
				if (!workspaceFolders) {
					vscode.window.showErrorMessage('No workspace folder available!');
					return match;
				}
				value = value.replace(findEscapedEndingBrace, '}');
				const folder = workspaceFolders.filter(({ name }) => name === value)[0];
				if (!folder) {
					vscode.window.showErrorMessage(`No workspace folder with name '${value}' available!`);
					return match;
				}
				return folder.uri.fsPath;
		}
		
		return match;
		
	});
	
}