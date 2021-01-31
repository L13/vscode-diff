//	Imports ____________________________________________________________________

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { isMacOs, isWindows } from '../@l13/platforms';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function reveal (pathname:string) {
	
	if (!fs.existsSync(pathname)) {
		vscode.window.showErrorMessage(`File "${pathname}" does not exit!`);
		return;
	}
	
	let process:ChildProcessWithoutNullStreams = null;
	
	if (isMacOs) process = spawn('open', ['-R', pathname || '/']);
	else if (isWindows) process = spawn('explorer', ['/select,', pathname || 'c:\\']);
	else process = spawn('xdg-open', [path.dirname(pathname) || '/']);
	
	process.on('error', (error:Error) => {
		
		process.kill();
		vscode.window.showErrorMessage(error.message);
		
	});
	
}

//	Functions __________________________________________________________________

