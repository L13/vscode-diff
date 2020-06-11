//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { isAbsolute } from 'path';
import * as vscode from 'vscode';

import { normalizeLineEnding, trimWhitespace } from '../@l13/nodes/buffers';
import { lstatSync, walkTree } from '../@l13/nodes/fse';

import { sortCaseInsensitive } from '../../@l13/natvies/arrays';
import { Dictionary, Diff, File, StatsMap } from '../../types';

import { DiffSettings, textfiles } from '../common/DiffSettings';
import { DiffResult } from '../output/DiffResult';

//	Variables __________________________________________________________________

const findPlaceholder = /^\$\{([a-zA-Z]+)(?:\:((?:\\\}|[^\}])*))?\}/;
const findEscapedEndingBrace = /\\\}/g;

//	Initialize _________________________________________________________________

type Start = {
	data:any,
	pathA:string,
	pathB:string
};

//	Exports ____________________________________________________________________

export class DiffCompare {
	
	private _onInitCompare:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onInitCompare:vscode.Event<undefined> = this._onInitCompare.event;
	
	private _onStartCompareFiles:vscode.EventEmitter<Start> = new vscode.EventEmitter<Start>();
	public readonly onStartCompareFiles:vscode.Event<Start> = this._onStartCompareFiles.event;
	
	private _onDidCompareFiles:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidCompareFiles:vscode.Event<undefined> = this._onDidCompareFiles.event;
	
	private _onStartCompareFolders:vscode.EventEmitter<Start> = new vscode.EventEmitter<Start>();
	public readonly onStartCompareFolders:vscode.Event<Start> = this._onStartCompareFolders.event;
	
	private _onDidCompareFolders:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidCompareFolders:vscode.Event<DiffResult> = this._onDidCompareFolders.event;
	
	private _onDidUpdateDiff:vscode.EventEmitter<Diff> = new vscode.EventEmitter<Diff>();
	public readonly onDidUpdateDiff:vscode.Event<Diff> = this._onDidUpdateDiff.event;
	
	private _onDidUpdateAllDiffs:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidUpdateAllDiffs:vscode.Event<DiffResult> = this._onDidUpdateAllDiffs.event;
	
	private _onDidNoCompare:vscode.EventEmitter<DiffResult> = new vscode.EventEmitter<DiffResult>();
	public readonly onDidNoCompare:vscode.Event<DiffResult> = this._onDidNoCompare.event;
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor () {
		
		//
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	public createDiffs (data:any) :void {
		
		this._onInitCompare.fire(data);
		
		let pathA = parsePredefinedVariables(data.pathA);
		let pathB = parsePredefinedVariables(data.pathB);
		
		if (!pathA) return this.sendEmptyResult(`The left path is empty.`, pathA, pathB);
		if (!pathB) return this.sendEmptyResult(`The right path is empty.`, pathA, pathB);
		
		if (!isAbsolute(pathA)) return this.sendEmptyResult(`The left path is not absolute.`, pathA, pathB);
		if (!isAbsolute(pathB)) return this.sendEmptyResult(`The right path is not absolute.`, pathA, pathB);
		
		pathA = vscode.Uri.file(pathA).fsPath;
		pathB = vscode.Uri.file(pathB).fsPath;
		
		if (pathA === pathB) return this.sendEmptyResult(`The left and right path is the same.`, pathA, pathB);
		
		const statA = lstatSync(pathA);
		if (!statA) return this.sendEmptyResult(`The left path "${pathA}" does not exist.`, pathA, pathB);
		
		const statB = lstatSync(pathB);
		if (!statB) return this.sendEmptyResult(`The right path "${pathB}" does not exist.`, pathA, pathB);
		
		if (statA.isFile() && statB.isFile()) this.compareFiles(data, pathA, pathB);
		else if (statA.isDirectory() && statB.isDirectory()) this.compareFolders(data, pathA, pathB);
		else this.sendEmptyResult(`The left and right path can't be compared!`, pathA, pathB);
		
	}
	
	public updateDiffs (data:any) :void {
		
		const ignoreEndOfLine = DiffSettings.get('ignoreEndOfLine', false);
		const ignoreTrimWhitespace = DiffSettings.ignoreTrimWhitespace();
		
		data.diffResult.diffs.forEach((diff:Diff) => {
			
			diff.fileA.stat = lstatSync(diff.fileA.path);
			diff.fileB.stat = lstatSync(diff.fileB.path);
			
			compareDiff(diff, diff.fileA, diff.fileB, ignoreEndOfLine, ignoreTrimWhitespace);
			
			this._onDidUpdateDiff.fire(diff);
			
		});
		
		this._onDidUpdateAllDiffs.fire(data.diffResult);
		
	}
	
	private compareFiles (data:any, pathA:string, pathB:string) {
		
		const left = vscode.Uri.file(pathA);
		const right = vscode.Uri.file(pathB);
		const openToSide = DiffSettings.get('openToSide', false);
		
		this._onStartCompareFiles.fire({ data, pathA, pathB });
		
		vscode.commands.executeCommand('vscode.diff', left, right, `${pathA} ↔ ${pathB}`, {
			preview: false,
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		});
		
		this.sendEmptyResult('', pathA, pathB);
		
		this._onDidCompareFiles.fire();
		
	}
	
	private async compareFolders (data:any, pathA:string, pathB:string) {
		
		this._onStartCompareFolders.fire({ data, pathA, pathB });
		
		let diffResult = null;
			
		try {
			diffResult = await this.createDiffList(pathA, pathB);
			if (!diffResult?.diffs.length) vscode.window.showInformationMessage('No files or folders to compare!');
		} catch (error) {
			diffResult = new DiffResult(pathA, pathB);
			vscode.window.showErrorMessage(error.message);
		}
				
		this._onDidCompareFolders.fire(diffResult);
		
	}
	
	
	private sendEmptyResult (text:string, pathA:string, pathB:string) {
		
		if (text) vscode.window.showErrorMessage(text);
		
		this._onDidNoCompare.fire(new DiffResult(pathA, pathB));
		
	}
	
	private async createDiffList (dirnameA:string, dirnameB:string) :Promise<DiffResult> {
		
		const ignore = DiffSettings.getIgnore(dirnameA, dirnameB);
		const diffResult:DiffResult = new DiffResult(dirnameA, dirnameB);
		const diffs:Dictionary<Diff> = {};
		
		return new Promise((resolve, reject) => {
			
			walkTree(dirnameA, { ignore }, (errorA, resultA) => {
				
				if (errorA) return reject(errorA);
				
				createListA(diffs, <StatsMap>resultA);
				
				walkTree(dirnameB, { ignore }, (errorB, resultB) => {
					
					if (errorB) return reject(errorB);
					
					createListB(diffs, <StatsMap>resultB);
					
					diffResult.diffs = Object.keys(diffs).sort(sortCaseInsensitive).map((relative) => diffs[relative]);
					
					resolve(diffResult);
					
				});
				
			});
			
		});
		
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

function createListB (diffs:Dictionary<Diff>, result:StatsMap) {
	
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
		} else compareDiff(diff, <File>diff.fileA, diff.fileB = file, ignoreEndOfLine, ignoreTrimWhitespace);
		
	});
	
}

function compareDiff (diff:Diff, fileA:File, fileB:File, ignoreEndOfLine:boolean, ignoreTrimWhitespace:boolean) {
	
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
			let bufferA = fs.readFileSync(fileA.path);
			let bufferB = fs.readFileSync(fileB.path);
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
				const bufferA = fs.readFileSync(fileA.path);
				const bufferB = fs.readFileSync(fileB.path);
				if (!bufferA.equals(bufferB)) diff.status = 'modified';
			}
		}
	} else if (fileA.type === 'symlink' && fileB.type === 'symlink') {
		const linkA = fs.readlinkSync(fileA.path);
		const linkB = fs.readlinkSync(fileB.path);
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
		
		vscode.window.showErrorMessage(`Variable '${match}' not valid!`);
		return match;
		
	});
	
}