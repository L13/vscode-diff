//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { workspacePaths } from '../common';

import { DiffMenu } from '../panel/DiffMenu';
import { DiffPanel } from '../panel/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel:DiffPanel) {
	
	currentDiffPanel.msg.on('update:menu', () => {
			
		currentDiffPanel.msg.send('update:menu', {
			history: DiffMenu.getHistory(currentDiffPanel.context),
			workspaces: workspacePaths(vscode.workspace.workspaceFolders),
		});
		
	});
	
}

//	Functions __________________________________________________________________

