//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Diff, DiffFile } from '../../types';

import { lstat } from '../@l13/nodes/fse';

import { SymlinkContentProvider } from './symlinks/SymlinkContentProvider';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOpen {
	
	private static async openFile (file:DiffFile, openToSide:boolean) {
		
		try {
			const stat = await lstat(file.fsPath);
			if (stat.isFile()) {
				const pathname = vscode.Uri.file(file.fsPath);
				vscode.commands.executeCommand('vscode.open', pathname, {
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else if (stat.isDirectory()) {
				//
			} else if (stat.isSymbolicLink()) {
				const pathname = SymlinkContentProvider.parse(file.fsPath);
				vscode.commands.executeCommand('vscode.open', pathname, {
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else vscode.window.showErrorMessage(`File can't be opened! '${file.path}' is not a file!`);
		} catch (error) {
			vscode.window.showErrorMessage(error.message);
		}
		
	}
	
	private static async openDiff (diff:Diff, openToSide:boolean) {
		
		try {
			const fileA:DiffFile = diff.fileA;
			const fileB:DiffFile = diff.fileB;
			const statA = await lstat(fileA.fsPath);
			const statB = await lstat(fileB.fsPath);
			
			if (statA.isFile() && statB.isFile()) {
				const left = vscode.Uri.file(fileA.fsPath);
				const right = vscode.Uri.file(fileB.fsPath);
				const title = fileA.name === fileB.name ? `${fileA.name} (${fileA.root} ↔ ${fileB.root})` : `${fileA.fsPath} ↔ ${fileB.fsPath}`;
				vscode.commands.executeCommand('vscode.diff', left, right, title, {
					preview: false,
					viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				});
			} else if (statA.isDirectory() && statB.isDirectory()) {
				// if (await dialogs.confirm(`Compare folder "${fileA.fsPath}" with folder "${fileB.fsPath}"`, 'Compare')) {
				// 	const left = vscode.Uri.file(fileA.fsPath);
				// 	const right = vscode.Uri.file(fileB.fsPath);
				// 	vscode.commands.executeCommand('l13Diff.openAndCompare', left, right, openToSide);
				// }
			} else if (statA.isSymbolicLink() && statB.isSymbolicLink()) {
				const left = SymlinkContentProvider.parse(fileA.fsPath);
				const right = SymlinkContentProvider.parse(fileB.fsPath);
				const title = fileA.name === fileB.name ? `${fileA.name} (${fileA.root} ↔ ${fileB.root})` : `${fileA.fsPath} ↔ ${fileB.fsPath}`;
				vscode.commands.executeCommand('vscode.diff', left, right, title, {
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
			case 'untracked':
				DiffOpen.openFile(diff.fileA || diff.fileB, openToSide);
				break;
			case 'modified':
			case 'unchanged':
				DiffOpen.openDiff(diff, openToSide);
				break;
			case 'ignored':
				if (diff.fileA && diff.fileB) DiffOpen.openDiff(diff, openToSide);
				else DiffOpen.openFile(diff.fileA || diff.fileB, openToSide);
				break;
		}
		
	}
	
}

//	Functions __________________________________________________________________

