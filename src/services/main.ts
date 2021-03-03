//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as favorites from './commands/favorites';
import * as history from './commands/history';
import * as list from './commands/list';
import * as output from './commands/output';
import * as panel from './commands/panel';
import * as projects from './commands/projects';
import * as settings from './commands/settings';
import * as shortcuts from './commands/shortcuts';
import * as symlinks from './commands/symlinks';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	favorites.activate(context);
	history.activate(context);
	list.activate(context);
	output.activate(context);
	panel.activate(context);
	projects.activate(context);
	settings.activate(context);
	shortcuts.activate(context);
	symlinks.activate(context);
	
}

export function deactivate () {
	
	//
	
}

//	Functions __________________________________________________________________

