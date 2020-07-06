//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffOutput } from '../services/output/DiffOutput';

import { register } from '../common/commands';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	register(context, {
		'l13Diff.showOutput': () => DiffOutput.currentOutput?.show(),
	});
	
}

//	Functions __________________________________________________________________

