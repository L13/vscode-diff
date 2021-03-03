//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Favorite, FavoriteGroup } from '../@types/favorites';
import { Comparison } from '../@types/history';

//	Variables __________________________________________________________________

const FAVORITES = 'favorites';
const FAVORITE_GROUPS = 'favoriteGroups';

const MENU_HISTORY = 'history';
const COMPARISONS_HISTORY = 'comparisons';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function getFavorites (context:vscode.ExtensionContext) :Favorite[] {
		
	return context.globalState.get(FAVORITES, []);
	
}

export function updateFavorites (context:vscode.ExtensionContext, favorites:Favorite[]) {
	
	context.globalState.update(FAVORITES, favorites);
	
}

export function getFavoriteGroups (context:vscode.ExtensionContext) :FavoriteGroup[] {
		
	return context.globalState.get(FAVORITE_GROUPS, []);
	
}

export function updateFavoriteGroups (context:vscode.ExtensionContext, favoriteGroups:FavoriteGroup[]) {
	
	context.globalState.update(FAVORITE_GROUPS, favoriteGroups);
	
}

export function getHistory (context:vscode.ExtensionContext) :string[] {
		
	return context.globalState.get(MENU_HISTORY, []);
	
}

export function updateHistory (context:vscode.ExtensionContext, history:string[]) {
	
	context.globalState.update(MENU_HISTORY, history);
	
}

export function getComparisons (context:vscode.ExtensionContext) :Comparison[] {
	
	return context.globalState.get(COMPARISONS_HISTORY, []);
	
}

export function updateComparisons (context:vscode.ExtensionContext, comparisons:Comparison[]) {
	
	context.globalState.update(COMPARISONS_HISTORY, comparisons);
	
}

//	Functions __________________________________________________________________

