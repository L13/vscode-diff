//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Dictionary } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function register (context: vscode.ExtensionContext, commands: Dictionary<(...args: any) => void>) {

	for (const [command, callback] of Object.entries(commands)) {
		context.subscriptions.push(vscode.commands.registerCommand(command, callback));
	}
	
}

//	Functions __________________________________________________________________

