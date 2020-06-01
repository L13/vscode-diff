//	Imports ____________________________________________________________________

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { Diff, File } from '../types';
import { isMacOs, isWindows } from './@l13/os/platforms';
import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOpen {
	
	private disposables:vscode.Disposable[] = [];
	
	public constructor (msg:DiffMessage) {
		
		msg.on('open:diffToSide', (data) => this.open(data, true));
		msg.on('open:diff', (data) => this.open(data, vscode.workspace.getConfiguration('l13Diff').get('openToSide', false)));
		
		msg.on('reveal:file', (data) => this.reveal(data));
		
	}
	
	public dispose () :void {
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
	}
	
	private openFile (file:File, openToSide:boolean) :void {
		
		fs.lstat(file.path, (error, stat) => {
			
			if (error) return vscode.window.showErrorMessage(error.message);
			
			if (stat.isFile()) {
				const pathname = vscode.Uri.file(file.path);
				vscode.commands.executeCommand('vscode.open', pathname, {
					// preserveFocus: false,
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else vscode.window.showErrorMessage(`File can't be opened! '${file.path}' is not a file!`);
			
		});
		
	}
	
	private openDiff (diff:Diff, openToSide:boolean) :void {
		
		const fileA:File = <File>diff.fileA;
		
		fs.lstat(fileA.path, (errorA, statA) => {
			
			if (errorA) return vscode.window.showErrorMessage(errorA.message);
			
			if (statA.isFile()) {
				const fileB:File = <File>diff.fileB;
				fs.lstat(fileB.path, (errorB, statB) => {
					
					if (errorB) return vscode.window.showErrorMessage(errorB.message);
					
					if (statB.isFile()) {
						const left = vscode.Uri.file(fileA.path);
						const right = vscode.Uri.file(fileB.path);
						vscode.commands.executeCommand('vscode.diff', left, right, `${fileA.name} (${fileA.folder} ↔ ${fileB.folder})`, {
							// preserveFocus: false,
							preview: false,
							viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
						});
					} else vscode.window.showErrorMessage(`Files can't be compared! '${fileB.path}' is not a file!`);
					
				});
			} else vscode.window.showErrorMessage(`Files can't be compared! '${fileA.path}' is not a file!`);
			
		});
		
	}
	
	private open (data:any, openToSide:boolean) :void {
		
		const diff:Diff = data.diff;
		
		switch (diff.status) {
			case 'deleted':
				this.openFile(<File>diff.fileA, openToSide);
				break;
			case 'modified':
			case 'unchanged':
				this.openDiff(diff, openToSide);
				break;
			case 'untracked':
				this.openFile(<File>diff.fileB, openToSide);
				break;
		}
		
	}
	
	private reveal (data:any) :void {
		
		const pathname:string = data.pathname;
		
		if (isMacOs) showFileInFinder(pathname);
		else if (isWindows) showFileInExplorer(pathname);
		else showFileInFolder(pathname);
		
	}
	
}

//	Functions __________________________________________________________________

function showFileInFinder (pathname:string) {
	
	const process = spawn('open', ['-R', pathname || '/']);
	
	process.on('error', (error:Error) => {
		
		process.kill();
		vscode.window.showErrorMessage(error.message);
		
	});
	
}

function showFileInExplorer (pathname:string) {
	
	const process = spawn('explorer', ['/select,', pathname || 'c:\\']);
	
	process.on('error', (error:Error) => {
		
		process.kill();
		vscode.window.showErrorMessage(error.message);
		
	});
	
}

function showFileInFolder (pathname:string) {
	
	const process = spawn('xdg-open', [path.dirname(pathname) || '/']);
	
	process.on('error', (error:Error) => {
		
		process.kill();
		vscode.window.showErrorMessage(error.message);
		
	});
	
}