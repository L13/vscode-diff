//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { workspacePaths } from '../common/paths';

import { DiffPanel } from '../panel/DiffPanel';

import { MenuState } from '../states/MenuState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel:DiffPanel) {
	
	const menuState = MenuState.create(currentDiffPanel.context);
	
	currentDiffPanel.msg.on('update:menu', () => {
			
		currentDiffPanel.msg.send('update:menu', {
			history: menuState.get(),
			workspaces: workspacePaths(vscode.workspace.workspaceFolders),
		});
		
	});
	
}

//	Functions __________________________________________________________________

