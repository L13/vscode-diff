//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as vscode from 'vscode';

import { walktree } from './@l13/fse';

import { Dictionary, Diff, DiffResult, File, StatsMap } from '../types';
import { DiffStatus } from './DiffStatus';

//	Variables __________________________________________________________________

const findPlaceholder = /\$\{([a-zA-Z]+)\}/;
const findPlaceholders = /\$\{([a-zA-Z]+)\}/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffList {
	
	private readonly panel:vscode.WebviewPanel;
	private readonly context:vscode.ExtensionContext;
	
	private readonly status:DiffStatus;
	private disposables:vscode.Disposable[] = [];
	
	public constructor (panel:vscode.WebviewPanel, context:vscode.ExtensionContext, status:DiffStatus) {
		
		this.panel = panel;
		this.context = context;
		this.status = status;
		
		this.panel.webview.onDidReceiveMessage((message) => {
			
			if (message.command === 'create:diffs') {
				this.createDiffs(message);
			}
			
		}, null, this.disposables);
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private saveHistory (pathA:string, pathB:string) :void {
		
		const history:string[] = this.context.globalState.get('history') || [];
		
		addToRecentlyUsed(history, pathB);
		addToRecentlyUsed(history, pathA);
		
		const maxLength:number = <number>vscode.workspace.getConfiguration('l13Diff').get('maxRecentlyUsed', 10);
		
		this.context.globalState.update('history', history.slice(0, maxLength));
		
	}
	
	private createDiffs (message:any) :void {
		
		const pathA = parsePredefinedVariables(message.pathA);
		const pathB = parsePredefinedVariables(message.pathB);
		
		this.status.update();
		
		if (findPlaceholder.test(pathA) || findPlaceholder.test(pathB)) {
			this.panel.webview.postMessage({ command: message.command, diffResult: { pathA, pathB, diffs: [] } });
			return;
		}
		
		if (pathA === pathB) {
			vscode.window.showInformationMessage(`The left and right path is the same.`);
			this.panel.webview.postMessage({ command: message.command, diffResult: { pathA, pathB, diffs: [] } });
			return;
		}
		
		if (!fs.existsSync(pathA)) {
			vscode.window.showErrorMessage(`The left path '${pathA}' does not exist.`);
			this.panel.webview.postMessage({ command: message.command, diffResult: { pathA, pathB, diffs: [] } });
			return;
		}
		
		if (!fs.existsSync(pathB)) {
			vscode.window.showErrorMessage(`The right path '${pathB}' does not exist.`);
			this.panel.webview.postMessage({ command: message.command, diffResult: { pathA, pathB, diffs: [] } });
			return;
		}
		
		const statA = fs.lstatSync(pathA);
		const statB = fs.lstatSync(pathB);
		
		if (statA.isFile() && statB.isFile()) {
			this.saveHistory(message.pathA, message.pathB);
			const left = vscode.Uri.file(pathA);
			const right = vscode.Uri.file(pathB);
			const openToSide = vscode.workspace.getConfiguration('l13Diff').get('openToSide', false);
			vscode.commands.executeCommand('vscode.diff', left, right, `${pathA} ↔ ${pathB}`, {
				// preserveFocus: false,
				preview: false,
				viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
			});
			this.panel.webview.postMessage({ command: message.command, diffResult: { pathA, pathB, diffs: [] } });
		} else if (statA.isDirectory() && statB.isDirectory()) {
			this.saveHistory(message.pathA, message.pathB);
			this.createDiffList(pathA, pathB, (error:null|Error, diffResult:undefined|DiffResult) => {
				
				if (error) vscode.window.showErrorMessage(error.message);
				
				if (diffResult) {
					const total = diffResult.total;
					this.status.update(`Compared ${total} file${total > 2 ? 's' : ''}`);
				} else this.status.update();
				
				this.panel.webview.postMessage({ command: message.command, diffResult });
				
			});
		} else {
			vscode.window.showErrorMessage(`The left and right path is not of the same type.`);
			this.panel.webview.postMessage({ command: message.command, diffResult: { pathA, pathB, diffs: [] } });
		}
		
	}
	
	private createDiffList (dirnameA:string, dirnameB:string, callback:(error:null|Error, diff?:DiffResult) => void) :void {
		
		if (!isDirectory(dirnameA)) return callback(new Error(`Path '${dirnameA}' is not a directory!`));
		if (!isDirectory(dirnameB)) return callback(new Error(`Path '${dirnameB}' is not a directory!`));
		
		const ignore = <string[]>vscode.workspace.getConfiguration('l13Diff').get('ignore');
		const diffResult:DiffResult = { pathA: dirnameA, pathB: dirnameB, total: 0, diffs: [] };
		const diffs:Dictionary<Diff> = {};
		
		this.status.update('Scanning left directory');
		
		walktree(dirnameA, { ignore }, (errorA, resultA) => {
			
			if (errorA) return callback(errorA);
			
			diffResult.total += Object.keys(<StatsMap>resultA).length;
			createListA(diffs, <StatsMap>resultA);
			
			this.status.update('Scanning right directory');
			
			walktree(dirnameB, { ignore }, (errorB, resultB) => {
			
				if (errorB) return callback(errorB);
				
				this.status.update('Comparing files');
				
				setTimeout(() => { // Weird fix to let appear previous status message
					
					diffResult.total += Object.keys(<StatsMap>resultB).length;
					createListB(diffs, <StatsMap>resultB);
					
					diffResult.diffs = Object.keys(diffs).sort().map((relative) => diffs[relative]);
					
					callback(null, diffResult);
					
				}, 0);
				
			});
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

function addToRecentlyUsed (history:string[], path:string) {
	
	const index = history.indexOf(path);
	
	if (index !== -1) history.splice(index, 1);
	
	history.unshift(path);
	
}

function isDirectory (folder:string) :boolean {
	
	const stat = fs.existsSync(folder) ? fs.lstatSync(folder) : false;
	
	return !!(stat && stat.isDirectory());
	
}

function createListA (diffs:Dictionary<Diff>, result:StatsMap) {
	
	Object.keys(result).forEach((pathname) => {
		
		const file = result[pathname];
		
		diffs[file.relative] = {
			id: file.relative,
			status: 'deleted',
			type: file.type,
			fileA: file,
			fileB: null,
		};
		
	});
	
}

function createListB (diffs:Dictionary<Diff>, result:StatsMap) {
	
	Object.keys(result).forEach((pathname) => {
				
		const file = result[pathname];
		const diff = diffs[file.relative];
		
		if (diff) {
			diff.status = 'unchanged';
			
			const fileB = diff.fileB = file;
			const fileA = <File>diff.fileA;
			
			const statA = <fs.Stats>fileA.stat;
			const statB = <fs.Stats>fileB.stat;
			
			if (fileA.type !== fileB.type) {
				diff.status = 'modified';
				diff.type = 'mixed';
			} else if (fileA.type === 'file' && fileB.type === 'file') {
				if (statA.size !== statB.size) diff.status = 'modified';
				else {
					const bufferA = fs.readFileSync(fileA.path);
					const bufferB = fs.readFileSync(fileB.path);
					if (!bufferA.equals(bufferB)) diff.status = 'modified';
				}
			}
		} else {
			diffs[file.relative] = {
				id: file.relative,
				status: 'untracked',
				type: file.type,
				fileA: null,
				fileB: file,
			};
		}
		
	});
	
}

function parsePredefinedVariables (pathname:string) {
	
	// tslint:disable-next-line: only-arrow-functions
	return pathname.replace(findPlaceholders, function (match, name) {
		
		switch (name) {
			case 'workspaceFolder':
				const folder = vscode.workspace.workspaceFolders[0];
				if (!folder) {
					vscode.window.showErrorMessage('L13 Diff - No Workspace folder available!');
					return match;
				}
				return folder.uri.fsPath;
		}
		
		vscode.window.showErrorMessage(`L13 Diff - Placeholder '${match}' not valid!`);
		return match;
		
	});
	
}