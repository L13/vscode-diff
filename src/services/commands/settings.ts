//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as commands from '../common/commands';
import * as extensions from '../common/extensions';
import * as settings from '../common/settings';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	extensions.buildWhitelistForTextFiles();

	context.subscriptions.push(vscode.extensions.onDidChange(() => extensions.buildWhitelistForTextFiles()));
	
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
		
		if (event.affectsConfiguration('files.associations')) extensions.buildWhitelistForTextFiles();
		
	}));
	
	commands.register(context, {
		
		'l13Diff.action.settings.compareWhitespace': () => {
			
			const useDefault = settings.get('ignoreTrimWhitespace', 'default');
			
			if (useDefault === 'default') vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', false, true);
			else settings.update('ignoreTrimWhitespace', 'off');
			
		},
		
		'l13Diff.action.settings.ignoreWhitespace': () => {
			
			const useDefault = settings.get('ignoreTrimWhitespace', 'default');
			
			if (useDefault === 'default') vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', true, true);
			else settings.update('ignoreTrimWhitespace', 'on');
			
		},
		
		'l13Diff.action.settings.compareEndOfLine': () => settings.update('ignoreEndOfLine', false),
		'l13Diff.action.settings.ignoreEndOfLine': () => settings.update('ignoreEndOfLine', true),
		
		'l13Diff.action.settings.useCaseSensitive': () => settings.update('useCaseSensitiveFileName', 'on'),
		'l13Diff.action.settings.ignoreCaseSensitive': () => settings.update('useCaseSensitiveFileName', 'off'),
		
	});
	
}

//	Functions __________________________________________________________________

