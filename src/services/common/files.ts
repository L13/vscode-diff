//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { lstatSync } from '../@l13/fse';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________
	
export function reveal (pathname: string) {
	
	if (lstatSync(pathname)) {
		vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pathname));
	} else vscode.window.showErrorMessage(`Path "${pathname}" doesn't exist!`);
	
}

//	Functions __________________________________________________________________

