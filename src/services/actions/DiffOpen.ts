//	Imports ____________________________________________________________________

import { basename } from 'path';
import * as vscode from 'vscode';

import { Diff, DiffFile } from '../../types';

import { formatName, formatNameAndDesc } from '../@l13/formats';
import { lstat } from '../@l13/fse';

import * as settings from '../common/settings';

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
				const title = formatLabel(fileA, fileB);
				await openDiff(left, right, title, openToSide);
			} else if (statA.isDirectory() && statB.isDirectory()) {
				const left = vscode.Uri.file(fileA.fsPath);
				const right = vscode.Uri.file(fileB.fsPath);
				await vscode.commands.executeCommand('l13Diff.action.panel.openAndCompare', left, right, true, openToSide);
			} else if (statA.isSymbolicLink() && statB.isSymbolicLink()) {
				const left = SymlinkContentProvider.parse(fileA.fsPath);
				const right = SymlinkContentProvider.parse(fileB.fsPath);
				const title = formatLabel(fileA, fileB);
				await openDiff(left, right, title, openToSide);
			}
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

function formatLabel (fileA:DiffFile, fileB:DiffFile) {
	
	const labelFormat = settings.get('labelFormat', 'complete');
	let label = '';
	
	if (fileA.name !== fileB.name) {
		if (labelFormat === 'complete' || labelFormat === 'compact') {
			const [name, root] = formatNameAndDesc(fileA.fsPath, fileB.fsPath);
			label = labelFormat === 'complete' && root ? `${name} (${root})` : name;
		} else if (labelFormat === 'relative') label = formatName(fileA.name, fileB.name);
		else label = formatName(fileA.fsPath, fileB.fsPath);
	} else {
		if (labelFormat === 'complete') label = `${fileA.name} (${formatName(fileA.root, fileB.root)})`;
		else if (labelFormat === 'compact') {
			const [name] = formatNameAndDesc(fileA.root, fileB.root);
			label = `${fileA.name} (${name})`;
		} else if (labelFormat === 'relative') label = fileA.name;
		else label = basename(fileA.name);
	}
	
	return label;
	
}

async function openDiff (left:vscode.Uri, right:vscode.Uri, title:string, openToSide:boolean) {
	
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