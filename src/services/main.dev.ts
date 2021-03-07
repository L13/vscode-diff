//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as developer from './commands/developer';

import * as main from './main';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	main.activate(context);
	
	developer.activate(context);
	
}

export function deactivate () {
	
	//
	
}

//	Functions __________________________________________________________________

