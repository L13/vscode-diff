//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as common from './services/commands/common';
import * as favorites from './services/commands/favorites';
import * as history from './services/commands/history';
import * as list from './services/commands/list';
import * as output from './services/commands/output';
import * as panel from './services/commands/panel';
import * as projects from './services/commands/projects';
import * as settings from './services/commands/settings';
import * as shortcuts from './services/commands/shortcuts';
import * as symlinks from './services/commands/symlinks';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	common.activate(context);
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

