//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { register } from '../common/commands';

import { DiffOutput } from '../services/output/DiffOutput';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	register(context, {
		'l13Diff.showOutput': () => DiffOutput.currentOutput?.show(),
	});
	
}

//	Functions __________________________________________________________________

