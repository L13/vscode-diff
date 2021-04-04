//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function open (pathname:string) {
	
	if (fs.existsSync(pathname)) vscode.window.createTerminal({ cwd: pathname }).show();
	else vscode.window.showErrorMessage(`Path "${pathname}" doesn't exist!`);
	
}

//	Functions __________________________________________________________________

