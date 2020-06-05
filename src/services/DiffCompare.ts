//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { join, isAbsolute } from 'path';
import * as vscode from 'vscode';

import { parse } from './@l13/natives/jsons';
import { normalizeLineEnding, trimWhitespace } from './@l13/nodes/buffers';
import { createFindGlob, lstatSync, walkTree, walkUp } from './@l13/nodes/fse';

import { Dictionary, Diff, File, StatsMap, TextFiles } from '../types';
import { sortCaseInsensitive } from './common';

import { DiffHistory } from './DiffHistory';
import { DiffMenu } from './DiffMenu';
import { DiffMessage } from './DiffMessage';
import { DiffOutput } from './DiffOutput';
import { DiffResult } from './DiffResult';
import { DiffStats } from './DiffStats';
import { DiffStatus } from './DiffStatus';

const push = Array.prototype.push;

//	Variables __________________________________________________________________

const findPlaceholder = /^\$\{([a-zA-Z]+)(?:\:((?:\\\}|[^\}])*))?\}/;
const findEscapedEndingBrace = /\\\}/g;

const textfiles:TextFiles = {
	extensions: [],
	filenames: [],
	glob: null,
};

//	Initialize _________________________________________________________________

buildWhitelistForTextFiles();

vscode.extensions.onDidChange(() => buildWhitelistForTextFiles());

//	Exports ____________________________________________________________________

export class DiffCompare {
	
	private readonly context:vscode.ExtensionContext;
	
	private readonly status:DiffStatus;
	private readonly output:DiffOutput;
	private readonly history:DiffHistory;
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (private msg:DiffMessage, context:vscode.ExtensionContext) {
		
		this.context = context;
		this.status = DiffStatus.createStatusBar(context);
		this.output = DiffOutput.createOutput();
		this.history = DiffHistory.createProvider(context);
		
		msg.on('create:diffs', (data) => this.createDiffs(data));
		msg.on('update:diffs', (data) => this.updateDiffs(data));
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private createDiffs (data:any) :void {
		
		this.status.update();
		this.output.clear();
		this.output.msg('LOG');
		this.output.msg();
		
		let pathA = parsePredefinedVariables(data.pathA);
		let pathB = parsePredefinedVariables(data.pathB);
		
		if (!pathA) {
			vscode.window.showErrorMessage(`The left path is empty.`);
			return this.postEmptyResult(pathA, pathB);
		}
		
		if (!pathB) {
			vscode.window.showErrorMessage(`The right path is empty.`);
			return this.postEmptyResult(pathA, pathB);
		}
		
		if (!isAbsolute(pathA)) {
			vscode.window.showErrorMessage(`The left path is not absolute.`);
			return this.postEmptyResult(pathA, pathB);
		}
		
		if (!isAbsolute(pathB)) {
			vscode.window.showErrorMessage(`The right path is not absolute.`);
			return this.postEmptyResult(pathA, pathB);
		}
		
		pathA = vscode.Uri.file(pathA).fsPath;
		pathB = vscode.Uri.file(pathB).fsPath;
		
		if (pathA === pathB) {
			vscode.window.showInformationMessage(`The left and right path is the same.`);
			return this.postEmptyResult(pathA, pathB);
		}
		
		const statA = lstatSync(pathA);
		
		if (!statA) {
			return this.postError(`The left path '${pathA}' does not exist.`, pathA, pathB);
		}
		
		const statB = lstatSync(pathB);
		
		if (!statB) {
			return this.postError(`The right path '${pathB}' does not exist.`, pathA, pathB);
		}
		
		if (statA.isFile() && statB.isFile()) this.compareFiles(data, pathA, pathB);
		else if (statA.isDirectory() && statB.isDirectory()) this.compareFolders(data, pathA, pathB);
		else this.postError(`The left and right path can't be compared!`, pathA, pathB);
		
	}
	
	private updateDiffs (data:any) :void {
		
		const workspace = vscode.workspace;
		const ignoreEndOfLine = workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false);
		const useDefault = workspace.getConfiguration('l13Diff').get('ignoreTrimWhitespace', 'default');
		const ignoreTrimWhitespace = useDefault === 'default' ? workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace', true) : useDefault === 'on';
		
		data.diffResult.diffs.forEach((diff:Diff) => {
			
			const status = diff.status;
			let statusInfo = ` Files are still '${status}'.`;
			
			diff.fileA.stat = lstatSync(diff.fileA.path);
			diff.fileB.stat = lstatSync(diff.fileB.path);
			
			compareDiff(diff, diff.fileA, diff.fileB, ignoreEndOfLine, ignoreTrimWhitespace);
			
			if (status !== diff.status) statusInfo = ` Status has changed from '${status}' to '${diff.status}'.`;
			
			this.output.log(`Compared diff "${diff.id}".${statusInfo}`);
			
		});
		
		this.msg.send('update:diffs', data);
		
	}
	
	private saveRecentlyUsed (pathA:string, pathB:string) :void {
		
		DiffMenu.saveRecentlyUsed(this.context, pathA, pathB);
		
	}
	
	private saveHistory (pathA:string, pathB:string) {
		
		DiffHistory.saveComparison(this.context, pathA, pathB);
		this.history.refresh();
		
	}
	
	private compareFiles (data:any, pathA:string, pathB:string) {
		
		const left = vscode.Uri.file(pathA);
		const right = vscode.Uri.file(pathB);
		const openToSide = vscode.workspace.getConfiguration('l13Diff').get('openToSide', false);
		
		this.saveRecentlyUsed(data.pathA, data.pathB);
		this.saveHistory(pathA, pathB);
		this.output.log(`Comparing "${pathA}" ↔ "${pathB}"`);
		
		vscode.commands.executeCommand('vscode.diff', left, right, `${pathA} ↔ ${pathB}`, {
			preview: false,
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		});
		
		this.postEmptyResult(pathA, pathB);
		
	}
	
	private compareFolders (data:any, pathA:string, pathB:string) {
		
		this.saveRecentlyUsed(data.pathA, data.pathB);
		this.saveHistory(pathA, pathB);
		this.output.log(`Comparing "${pathA}" ↔ "${pathB}"`);
		
		this.createDiffList(pathA, pathB, (error:null|Error, diffResult:undefined|DiffResult) => {
			
			if (error) {
				diffResult = new DiffResult(pathA, pathB);
				vscode.window.showErrorMessage(error.message);
				this.status.update();
			} else {
				if (!diffResult) this.status.update();
				else if (!diffResult.diffs.length) vscode.window.showInformationMessage('No files or folders to compare!');
			}
			
			this.msg.send('create:diffs', { diffResult });
			
		});
		
	}
	
	private postError (text:string, pathA:string, pathB:string) {
		
		this.output.log(text);
		vscode.window.showErrorMessage(text);
		
		this.postEmptyResult(pathA, pathB);
		
	}
	
	private postEmptyResult (pathA:string, pathB:string) {
		
		this.msg.send('create:diffs', { diffResult: new DiffResult(pathA, pathB) });
		
	}
	
	private createDiffList (dirnameA:string, dirnameB:string, callback:(error:null|Error, diff?:DiffResult) => void) :void {
		
		if (!isDirectory(dirnameA)) return callback(new Error(`Path '${dirnameA}' is not a folder!`));
		if (!isDirectory(dirnameB)) return callback(new Error(`Path '${dirnameB}' is not a folder!`));
		
		const ignore = getSettingsIgnore(dirnameA, dirnameB);
		const diffResult:DiffResult = new DiffResult(dirnameA, dirnameB);
		const diffs:Dictionary<Diff> = {};
		
		this.output.log(`Scanning folder "${dirnameA}"`);
		
		walkTree(dirnameA, { ignore }, (errorA, resultA) => {
			
			if (errorA) return callback(errorA);
			
			createListA(diffs, <StatsMap>resultA);
			
			this.output.log(`Scanning folder "${dirnameB}"`);
			
			walkTree(dirnameB, { ignore }, (errorB, resultB) => {
				
				if (errorB) return callback(errorB);
				
				this.output.log('Comparing files');
				
				createListB(diffs, <StatsMap>resultB);
				
				this.output.log('Compared files');
				
				diffResult.diffs = Object.keys(diffs).sort(sortCaseInsensitive).map((relative) => diffs[relative]);
				
				const diffStats = new DiffStats(diffResult);
				const total = diffStats.all.total;
				
				this.status.update(`Compared ${total} entr${total === 1 ? 'y' : 'ies'}`);
				
				this.output.msg();
				this.output.msg();
				this.output.msg(diffStats.report());
				
				callback(null, diffResult);
				
			});
			
		});
		
	}

}

//	Functions __________________________________________________________________

function isDirectory (folder:string) :boolean {
	
	const stat = lstatSync(folder);
	
	return !!(stat && stat.isDirectory());
	
}

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
	
	const workspace = vscode.workspace;
	const ignoreEndOfLine = workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false);
	const useDefault = workspace.getConfiguration('l13Diff').get('ignoreTrimWhitespace', 'default');
	const ignoreTrimWhitespace = useDefault === 'default' ? workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace', true) : useDefault === 'on';
	
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

function buildWhitelistForTextFiles () {
	
	const config = vscode.workspace.getConfiguration();
	
	textfiles.extensions = ['.txt'];
	textfiles.filenames = [];
	
	vscode.extensions.all.forEach((extension) => {
		
		const packageJSON = extension.packageJSON;
		
		if (packageJSON.contributes && packageJSON.contributes.languages) {
			packageJSON.contributes.languages.forEach((language:any) => {
				
				if (language.extensions) push.apply(textfiles.extensions, language.extensions);
				if (language.filenames) push.apply(textfiles.filenames, language.filenames);
				
			});
		}
		
	});
	
	if (config.has('files.associations')) {
		textfiles.glob = createFindGlob(Object.keys(config.get<object>('files.associations', {})));
	} else textfiles.glob = null;
	
	textfiles.extensions.sort();
	textfiles.filenames.sort();
	
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

function loadSettingsIgnore (pathname:string) :string[] {
	
	const codePath = walkUp(pathname, '.vscode');
	
	if (!codePath) return null;
	
	const codeSettingsPath = join(codePath, 'settings.json');
	const stat = lstatSync(codeSettingsPath);
	let json:any = {};
	
	if (stat && stat.isFile()) {
		const content = fs.readFileSync(codeSettingsPath, { encoding: 'utf-8' });
		try {
			json = parse(content);
		} catch {
			vscode.window.showErrorMessage(`Syntax error in settings file '${codeSettingsPath}'!`);
		}
	}
	
	return json['l13Diff.ignore'] || null;
	
}

function useWorkspaceSettings (pathname:string) :boolean {
	
	return vscode.workspace.workspaceFile && vscode.workspace.workspaceFolders.some((folder) => pathname.startsWith(folder.uri.fsPath));
	
}

function getSettingsIgnore (pathA:string, pathB:string) :string[] {
	
	const ignores = <string[]>vscode.workspace.getConfiguration('l13Diff').get('ignore', []);
	const ignoresA:string[] = useWorkspaceSettings(pathA) ? ignores : loadSettingsIgnore(pathA) || ignores;
	const ignoresB:string[] = useWorkspaceSettings(pathB) ? ignores : loadSettingsIgnore(pathB) || ignores;
	
	return [].concat(ignoresA, ignoresB).filter((value, index, values) => values.indexOf(value) === index);
	
}