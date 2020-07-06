//	Imports ____________________________________________________________________

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

import { isMacOs, isWindows } from '../@l13/platforms';

import * as settings from './settings';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

// export function open (pathname:string, newWindow?:boolean) {
	
// 	newWindow = newWindow ?? settings.get('openInNewWindow', false);
	
// 	vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(pathname), newWindow);
	
// }
	
export function reveal (pathname:string) :void {
	
	let process:ChildProcessWithoutNullStreams = null;
	
	if (isMacOs) process = showFileInFinder(pathname);
	else if (isWindows) process = showFileInExplorer(pathname);
	else process = showFileInFolder(pathname);
	
	process.on('error', (error:Error) => {
		
		process.kill();
		vscode.window.showErrorMessage(error.message);
		
	});
	
}

//	Functions __________________________________________________________________

function showFileInFinder (pathname:string) {
	
	return spawn('open', ['-R', pathname || '/']);
	
}

function showFileInExplorer (pathname:string) {
	
	return spawn('explorer', ['/select,', pathname || 'c:\\']);
	
}

function showFileInFolder (pathname:string) {
	
	return spawn('xdg-open', [path.dirname(pathname) || '/']);
	
}