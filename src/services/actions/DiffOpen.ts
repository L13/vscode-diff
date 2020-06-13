//	Imports ____________________________________________________________________

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { Diff, DiffFile } from '../../types';

import { lstat } from '../@l13/nodes/fse';
import { isMacOs, isWindows } from '../@l13/nodes/platforms';

import { DiffDialog } from '../common/DiffDialog';
import { SymlinkContentProvider } from './symlinks/SymlinkContentProvider';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOpen {
	
	private static openFile (file:DiffFile, openToSide:boolean) :void {
		
		fs.lstat(file.path, (error, stat) => {
			
			if (error) return vscode.window.showErrorMessage(error.message);
			
			if (stat.isFile()) {
				const pathname = vscode.Uri.file(file.path);
				vscode.commands.executeCommand('vscode.open', pathname, {
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else vscode.window.showErrorMessage(`File can't be opened! '${file.path}' is not a file!`);
			
		});
		
	}
	
	private static async openDiff (diff:Diff, openToSide:boolean) {
		
		try {
			const fileA:DiffFile = diff.fileA;
			const fileB:DiffFile = diff.fileB;
			const statA = await lstat(fileA.path);
			const statB = await lstat(fileB.path);
			
			if (statA.isFile() && statB.isFile()) {
				const left = vscode.Uri.file(fileA.path);
				const right = vscode.Uri.file(fileB.path);
				vscode.commands.executeCommand('vscode.diff', left, right, `${fileA.name} (${fileA.folder} ↔ ${fileB.folder})`, {
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else if (statA.isDirectory() && statB.isDirectory()) {
				const value = await DiffDialog.confirm(`Compare folder "${fileA.path}" with folder "${fileB.path}"`, 'Compare');
				if (value) {
					const left = vscode.Uri.file(fileA.path);
					const right = vscode.Uri.file(fileB.path);
					vscode.commands.executeCommand('l13Diff.openAndCompare', left, right, openToSide);
				}
			} else if (statA.isSymbolicLink() && statB.isSymbolicLink()) {
				const left = SymlinkContentProvider.parse(fileA.path);
				const right = SymlinkContentProvider.parse(fileB.path);
				vscode.commands.executeCommand('vscode.diff', left, right, `${fileA.name} (${fileA.folder} ↔ ${fileB.folder})`, {
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else vscode.window.showErrorMessage(`Files can't be compared!`)
		} catch (error) {
			vscode.window.showErrorMessage(error.message);
		}
		
	}
	
	public static open (diff:Diff, openToSide:boolean) :void {
		
		switch (diff.status) {
			case 'deleted':
				DiffOpen.openFile(diff.fileA, openToSide);
				break;
			case 'modified':
			case 'unchanged':
				DiffOpen.openDiff(diff, openToSide);
				break;
			case 'untracked':
				DiffOpen.openFile(diff.fileB, openToSide);
				break;
		}
		
	}
	
	public static reveal (pathname:string) :void {
		
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