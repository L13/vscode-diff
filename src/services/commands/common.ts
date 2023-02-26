//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import * as states from '../common/states';

import { FavoritesProvider } from '../sidebar/FavoritesProvider';
import { HistoryProvider } from '../sidebar/HistoryProvider';

import { FavoriteGroupsState } from '../states/FavoriteGroupsState';
import { FavoritesState } from '../states/FavoritesState';
import { HistoryState } from '../states/HistoryState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	const favoritesState = FavoritesState.create(context);
	const favoriteGroupsState = FavoriteGroupsState.create(context);
	const historyState = HistoryState.create(context);
	
	let previousLastModified = states.getStateInfo(context).lastModified;
	
	context.subscriptions.push(vscode.window.onDidChangeWindowState(({ focused }) => {
		
		if (focused) { // Update data if changes in another workspace have been done
			const currentLastModified = states.getStateInfo(context).lastModified;
			if (previousLastModified !== currentLastModified) {
				previousLastModified = currentLastModified;
				FavoritesProvider.current?.refresh({
					favorites: favoritesState.get(),
					favoriteGroups: favoriteGroupsState.get(),
				});
				HistoryProvider.current?.refresh({
					comparisons: historyState.get(),
				});
			}
		}
		
	}));
	
}

//	Functions __________________________________________________________________

