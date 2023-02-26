//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Comparison, Favorite, FavoriteGroup, StateInfo } from '../../types';

//	Variables __________________________________________________________________

const STATE_INFO = 'stateInfo';

const FAVORITES = 'favorites';
const FAVORITE_GROUPS = 'favoriteGroups';

const MENU_HISTORY = 'history';
const COMPARISONS_HISTORY = 'comparisons';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function getStateInfo (context: vscode.ExtensionContext): StateInfo {
		
	return context.globalState.get(STATE_INFO, { lastModified: 0 });
	
}

export function getFavorites (context: vscode.ExtensionContext): Favorite[] {
		
	return context.globalState.get(FAVORITES, []);
	
}

export function updateFavorites (context: vscode.ExtensionContext, favorites: Favorite[]) {
	
	context.globalState.update(FAVORITES, favorites);
	
	updateStateInfo(context);
	
}

export function getFavoriteGroups (context: vscode.ExtensionContext): FavoriteGroup[] {
		
	return context.globalState.get(FAVORITE_GROUPS, []);
	
}

export function updateFavoriteGroups (context: vscode.ExtensionContext, favoriteGroups: FavoriteGroup[]) {
	
	context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
	
	updateStateInfo(context);
	
}

export function getHistory (context: vscode.ExtensionContext): string[] {
		
	return context.globalState.get(MENU_HISTORY, []);
	
}

export function updateHistory (context: vscode.ExtensionContext, history: string[]) {
	
	context.globalState.update(MENU_HISTORY, history);
	
	updateStateInfo(context);
	
}

export function getComparisons (context: vscode.ExtensionContext): Comparison[] {
	
	return context.globalState.get(COMPARISONS_HISTORY, []);
	
}

export function updateComparisons (context: vscode.ExtensionContext, comparisons: Comparison[]) {
	
	context.globalState.update(COMPARISONS_HISTORY, comparisons);
	
	updateStateInfo(context);
	
}

export function updateCollapseState (context: vscode.ExtensionContext, favoriteGroups: FavoriteGroup[]) {
	
	context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
	
}

//	Functions __________________________________________________________________

function updateStateInfo (context: vscode.ExtensionContext) {
	
	context.globalState.update(STATE_INFO, {
		lastModified: +new Date(),
	});
	
}