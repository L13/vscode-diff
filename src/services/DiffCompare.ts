//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { basename, dirname, extname, join, sep } from 'path';
import * as vscode from 'vscode';

import { createFindGlob, lstatSync, walkTree, walkUp } from './@l13/fse';

import { Dictionary, Diff, File, StatsMap, TextFiles } from '../types';
import { removeCommentsFromJSON, sortCaseInsensitive } from './common';
import { DiffHistory } from './DiffHistory';
import { DiffMenu } from './DiffMenu';
import { DiffMessage } from './DiffMessage';
import { DiffOutput } from './DiffOutput';
import { DiffResult } from './DiffResult';
import { DiffStats } from './DiffStats';
import { DiffStatus } from './DiffStatus';

const push = Array.prototype.push;

//	Variables __________________________________________________________________

const findPlaceholder = /\$\{([a-zA-Z]+)(?:\:((?:\\\}|[^\}])*))?\}/;
const findPlaceholders = /\$\{([a-zA-Z]+)(?:\:((?:\\\}|[^\}])*))?\}/g;
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
		
		if (findPlaceholder.test(pathA) || findPlaceholder.test(pathB)) {
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
		this.output.log(`Comparing '${pathA}' ↔ '${pathB}'`);
		
		vscode.commands.executeCommand('vscode.diff', left, right, `${pathA} ↔ ${pathB}`, {
			preview: false,
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		});
		
		this.postEmptyResult(pathA, pathB);
		
	}
	
	private compareFolders (data:any, pathA:string, pathB:string) {
		
		this.saveRecentlyUsed(data.pathA, data.pathB);
		this.saveHistory(pathA, pathB);
		this.output.log(`Comparing '${pathA}' ↔ '${pathB}'`);
		
		this.createDiffList(pathA, pathB, (error:null|Error, diffResult:undefined|DiffResult) => {
			
			if (error) vscode.window.showErrorMessage(error.message);
			
			if (!diffResult) this.status.update();
			else if (!diffResult.diffs.length) vscode.window.showInformationMessage('No files or folders to compare!');
			
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
		
		this.output.log(`Scanning folder '${dirnameA}'`);
		
		walkTree(dirnameA, { ignore }, (errorA, resultA) => {
			
			if (errorA) return callback(errorA);
			
			createListA(diffs, <StatsMap>resultA);
			
			this.output.log(`Scanning folder '${dirnameB}'`);
			
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
		const relative = file.relative;
		const name = dirname(relative);
		
		diffs[file.relative] = {
			id: relative,
			basename: basename(relative),
			dirname: name !== '.' ? name + sep : '',
			extname: extname(relative),
			status: 'deleted',
			type: file.type,
			ignoredWhitespace: false,
			ignoredEOL: false,
			fileA: file,
			fileB: null,
		};
		
	});
	
}

function createListB (diffs:Dictionary<Diff>, result:StatsMap) {
	
	const ignoreEndOfLine = vscode.workspace.getConfiguration('l13Diff').get('ignoreEndOfLine', false);
	const useDefault = vscode.workspace.getConfiguration('l13Diff').get('ignoreTrailingWhitespace', 'default');
	const ignoreTrailingWhitespace = useDefault === 'default' ? vscode.workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace', false) : useDefault === 'on';
	
	Object.keys(result).forEach((pathname) => {
				
		const file = result[pathname];
		const relative = file.relative;
		const diff = diffs[relative];
		
		if (diff) {
			diff.status = 'unchanged';
			
			const fileB = diff.fileB = file;
			const fileA = <File>diff.fileA;
			
			const statA = <fs.Stats>fileA.stat;
			const statB = <fs.Stats>fileB.stat;
			
			if (fileA.type !== fileB.type) {
				diff.status = 'conflicting';
				diff.type = 'mixed';
			} else if (fileA.type === 'file' && fileB.type === 'file') {
				if ((ignoreEndOfLine || ignoreTrailingWhitespace) &&
					(textfiles.extensions.includes(diff.extname) ||
					textfiles.filenames.includes(diff.basename) ||
					textfiles.glob && textfiles.glob.test(diff.basename))) {
					let bufferA = fs.readFileSync(fileA.path);
					let bufferB = fs.readFileSync(fileB.path);
				//	If files are equal normalizing is not necessary
					if (statA.size === statB.size && bufferA.equals(bufferB)) return;
					if (ignoreTrailingWhitespace) {
						bufferA = trimTrailingWhitespace(bufferA);
						bufferB = trimTrailingWhitespace(bufferB);
						diff.ignoredWhitespace = true;
					}
					if (ignoreEndOfLine) {
						const maxLength = Math.max(bufferA.length, bufferB.length);
						bufferA = normalizeBuffer(bufferA, maxLength);
						bufferB = normalizeBuffer(bufferB, maxLength);
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
		} else {
			const name = dirname(relative);
			
			diffs[file.relative] = {
				id: relative,
				basename: basename(relative),
				dirname: name !== '.' ? name + sep : '',
				extname: extname(relative),
				status: 'untracked',
				type: file.type,
				ignoredWhitespace: false,
				ignoredEOL: false,
				fileA: null,
				fileB: file,
			};
		}
		
	});
	
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

function hasUTF16BOM (buffer:Buffer) {
	
	return buffer[0] === 254 && buffer[1] === 255 || buffer[0] === 255 && buffer[1] === 254;
	
}

function normalizeBuffer (buffer:Buffer, maxLength:number) {
	
	const cache = Buffer.alloc(maxLength);
	const length = buffer.length;
	const utf16Fix = hasUTF16BOM(buffer) ? 1 : 0;
	let index = 0;
	let i = 0;
	
	while (i < length) {
		const value = buffer[i++];
		if (value === 13) {
			if (buffer[i + utf16Fix] !== 10) cache[index++] = 10;
			i += utf16Fix;
		} else cache[index++] = value;
	}
	
	return cache;
	
}

function parsePredefinedVariables (pathname:string) {
	
	// tslint:disable-next-line: only-arrow-functions
	return pathname.replace(findPlaceholders, function (match, placeholder, value) {
		
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
			json = JSON.parse(removeCommentsFromJSON(content));
		} catch {
			vscode.window.showErrorMessage(`Syntax error in settings file '${codeSettingsPath}'!`);
		}
	}
	
	return json['l13Diff.ignore'] || null;
	
}

function useWorkspaceSettings (pathname:string) :boolean {
	
	return vscode.workspace.workspaceFile && vscode.workspace.workspaceFolders.some((folder) => pathname.indexOf(folder.uri.fsPath) === 0);
	
}

function getSettingsIgnore (pathA:string, pathB:string) :string[] {
	
	const ignores = <string[]>vscode.workspace.getConfiguration('l13Diff').get('ignore', []);
	const ignoresA:string[] = useWorkspaceSettings(pathA) ? ignores : loadSettingsIgnore(pathA) || ignores;
	const ignoresB:string[] = useWorkspaceSettings(pathB) ? ignores : loadSettingsIgnore(pathB) || ignores;
	
	return [].concat(ignoresA, ignoresB).filter((value, index, values) => values.indexOf(value) === index);
	
}

function trimTrailingWhitespaceForAscii (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [];
	let cache = [];
	let i = 0;
	
	if (buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) {
		newBuffer.push(239, 187, 191);
		i = 3;
	}
	
	stream: while (i < length) {
		const value = buffer[i++];
		if (value === 13 || value === 10 || i === length) {
			if (!cache.length) {
				newBuffer[newBuffer.length] = value;
				continue stream;
			}
			if (i === length) cache[cache.length] = value;
			let j = 0;
			start: while (j < cache.length) {
				const cacheValue = cache[j];
				if (cacheValue === 9 || cacheValue === 11 || cacheValue === 12 || cacheValue === 32) {
					j++;
					continue start;
				}
				break start;
			}
			let k = cache.length;
			end: while (k > j) {
				const cacheValue = cache[k - 1];
				if (cacheValue === 9 || cacheValue === 11 || cacheValue === 12 || cacheValue === 32) {
					k--;
					continue end;
				}
				break end;
			}
			if (j !== k) push.apply(newBuffer, cache.slice(j, k));
			newBuffer[newBuffer.length] = value;
			cache = [];
		} else cache[cache.length] = value;
	}
	
	return Buffer.from(newBuffer);
	
}

function trimTrailingWhitespaceForUTF16BE (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [buffer[0], buffer[1]];
	let cache = [];
	let i = 2;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 0 && (valueB === 13 || valueB === 10)) {
			if (!cache.length) {
				newBuffer.push(valueA, valueB);
				continue stream;
			}
			let j = 0;
			start: while (j < cache.length) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 11 || cacheValueB === 12 || cacheValueB === 32)) {
					j += 2;
					continue start;
				}
				break start;
			}
			let k = cache.length;
			end: while (k > j) {
				const cacheValueA = cache[k - 2];
				const cacheValueB = cache[k - 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 11 || cacheValueB === 12 || cacheValueB === 32)) {
					k -= 2;
					continue end;
				}
				break end;
			}
			if (j !== k) push.apply(newBuffer, cache.slice(j, k));
			newBuffer.push(valueA, valueB);
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	if (cache.length) {
		let j = 0;
		start: while (j < cache.length) {
			const cacheValueA = cache[j];
			const cacheValueB = cache[j + 1];
			if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 11 || cacheValueB === 12 || cacheValueB === 32)) {
				j += 2;
				continue start;
			}
			break start;
		}
		let k = cache.length;
		end: while (k > j) {
			const cacheValueA = cache[k - 2];
			const cacheValueB = cache[k - 1];
			if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 11 || cacheValueB === 12 || cacheValueB === 32)) {
				k -= 2;
				continue end;
			}
			break end;
		}
		if (j !== k) push.apply(newBuffer, cache.slice(j, k));
	}
	
	return Buffer.from(newBuffer);
	
}

function trimTrailingWhitespaceForUTF16LE (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [buffer[0], buffer[1]];
	let cache = [];
	let i = 2;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueB === 0 && (valueA === 13 || valueA === 10)) {
			if (!cache.length) {
				newBuffer.push(valueA, valueB);
				continue stream;
			}
			let j = 0;
			start: while (j < cache.length) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 11 || cacheValueA === 12 || cacheValueA === 32)) {
					j += 2;
					continue start;
				}
				break start;
			}
			let k = cache.length - 1;
			end: while (k > j) {
				const cacheValueA = cache[k - 1];
				const cacheValueB = cache[k];
				if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 11 || cacheValueA === 12 || cacheValueA === 32)) {
					k -= 2;
					continue end;
				}
				break end;
			}
			if (j !== k) push.apply(newBuffer, cache.slice(j, k));
			newBuffer.push(valueA, valueB);
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	if (cache.length) {
		let j = 0;
		start: while (j < cache.length) {
			const cacheValueA = cache[j];
			const cacheValueB = cache[j + 1];
			if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 11 || cacheValueA === 12 || cacheValueA === 32)) {
				j += 2;
				continue start;
			}
			break start;
		}
		let k = cache.length - 1;
		end: while (k > j) {
			const cacheValueA = cache[k - 1];
			const cacheValueB = cache[k];
			if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 11 || cacheValueA === 12 || cacheValueA === 32)) {
				k -= 2;
				continue end;
			}
			break end;
		}
		if (j !== k) push.apply(newBuffer, cache.slice(j, k));
	}
	
	return Buffer.from(newBuffer);
	
}

function trimTrailingWhitespace (buffer:Buffer) :Buffer {
	
	if (buffer[0] === 254 && buffer[1] === 255) return trimTrailingWhitespaceForUTF16BE(buffer);
	if (buffer[0] === 255 && buffer[1] === 254) return trimTrailingWhitespaceForUTF16LE(buffer);
	
	return trimTrailingWhitespaceForAscii(buffer);
	
}