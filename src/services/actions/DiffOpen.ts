//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Diff, DiffFile } from '../../types';

import { formatNameAndDesc } from '../@l13/formats';
import { lstat } from '../@l13/fse';

import { SymlinkContentProvider } from './symlinks/SymlinkContentProvider';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOpen {
	
	public static async openFile (fsPathOrFile:string|DiffFile, openToSide:boolean) {
		
		try {
			const fsPath = typeof fsPathOrFile === 'string' ? fsPathOrFile : fsPathOrFile.fsPath;
			const stat = await lstat(fsPath);
			if (stat.isFile()) await openFile(vscode.Uri.file(fsPath), openToSide);
			// tslint:disable-next-line: no-unused-expression
			else if (stat.isDirectory()) void 0;
			else if (stat.isSymbolicLink()) await openFile(SymlinkContentProvider.parse(fsPath), openToSide);
			else vscode.window.showErrorMessage(`File can't be opened. "${fsPath}" is not a file.`);
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
				await openDiff(fileA, fileB, left, right, openToSide);
			} else if (statA.isDirectory() && statB.isDirectory()) {
				const left = vscode.Uri.file(fileA.fsPath);
				const right = vscode.Uri.file(fileB.fsPath);
				await vscode.commands.executeCommand('l13Diff.openAndCompare', left, right, true, openToSide);
			} else if (statA.isSymbolicLink() && statB.isSymbolicLink()) {
				const left = SymlinkContentProvider.parse(fileA.fsPath);
				const right = SymlinkContentProvider.parse(fileB.fsPath);
				await openDiff(fileA, fileB, left, right, openToSide);
			} else vscode.window.showErrorMessage(`Files can't be compared. Type of files are not equal.`)
		} catch (error) {
			vscode.window.showErrorMessage(error.message);
		}
		
	}
	
	public static async open (diff:Diff, openToSide:boolean) {
		
		switch (diff.status) {
			case 'deleted':
			case 'untracked':
				await DiffOpen.openFile(diff.fileA || diff.fileB, openToSide);
				break;
			case 'modified':
			case 'unchanged':
				await DiffOpen.openDiff(diff, openToSide);
				break;
			case 'ignored':
				if (diff.fileA && diff.fileB) await DiffOpen.openDiff(diff, openToSide);
				else await DiffOpen.openFile(diff.fileA || diff.fileB, openToSide);
				break;
		}
		
	}
	
}

//	Functions __________________________________________________________________

async function openDiff (fileA:DiffFile, fileB:DiffFile, left:vscode.Uri, right:vscode.Uri, openToSide:boolean) {
	
	let title = '';
	
	if (fileA.name !== fileB.name) {
		const [label, root] = formatNameAndDesc(fileA.fsPath, fileB.fsPath);
		title = `${label} (${root})`;
	} else title = `${fileA.name} (${fileA.root} ↔ ${fileB.root})`;
	
	await vscode.commands.executeCommand('vscode.diff', left, right, title, {
		preview: false,
		viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
	});
	
}



async function openFile (uri:vscode.Uri, openToSide:boolean) {
	
	await vscode.commands.executeCommand('vscode.open', uri, {
		preview: false,
		viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
	});
	
}