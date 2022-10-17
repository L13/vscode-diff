//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { DiffMenuMessage } from '../../../types';

import { workspacePaths } from '../../common/paths';

import { MenuState } from '../../states/MenuState';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	const menuState = MenuState.create(currentDiffPanel.context);
	
	currentDiffPanel.msg.on('update:menu', () => {
			
		currentDiffPanel.msg.send<DiffMenuMessage>('update:menu', {
			history: menuState.get(),
			workspaces: workspacePaths(vscode.workspace.workspaceFolders),
		});
		
	});
	
}

//	Functions __________________________________________________________________

