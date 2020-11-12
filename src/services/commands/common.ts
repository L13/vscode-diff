//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffFavorites } from '../sidebar/DiffFavorites';
import { DiffHistory } from '../sidebar/DiffHistory';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.window.onDidChangeWindowState(({ focused }) => {
		
		if (focused) { // Update data if changes in another workspace have been done
			DiffFavorites.currentProvider?.refresh();
			DiffHistory.currentProvider?.refresh();
		}
		
	}));
	
}

//	Functions __________________________________________________________________

