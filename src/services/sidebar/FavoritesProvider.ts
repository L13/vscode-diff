//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { Favorite, FavoriteGroup, FavoritesStates, FavoriteTreeItems, InitialState, RefreshFavoritesStates } from '../../types';

import * as settings from '../common/settings';

import { FavoriteGroupTreeItem } from './trees/FavoriteGroupTreeItem';
import { FavoriteTreeItem } from './trees/FavoriteTreeItem';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoritesProvider implements vscode.TreeDataProvider<FavoriteTreeItems> {
	
	private _onDidChangeTreeData:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidChangeTreeData:vscode.Event<undefined> = this._onDidChangeTreeData.event;
	
	public favorites:Favorite[] = [];
	public favoriteGroups:FavoriteGroup[] = [];
	
	public disposables:vscode.Disposable[] = [];
	
	public static currentProvider:FavoritesProvider|undefined;
	
	public static createProvider (states:FavoritesStates) {
		
		return FavoritesProvider.currentProvider || (FavoritesProvider.currentProvider = new FavoritesProvider(states));
		
	}
	
	private constructor (states:FavoritesStates) {
		
		this.favorites = states.favorites;
		this.favoriteGroups = states.favoriteGroups;
		
		const initialState:InitialState = settings.get('initialFavoriteGroupState', 'Remember');
		
		if (initialState !== 'Remember') {
			this.favoriteGroups.forEach((favoriteGroup) => favoriteGroup.collapsed = initialState === 'Collapsed');
		}
		
	}
	
	public dispose () :void {
		
		FavoritesProvider.currentProvider = undefined;
		
	}
	
	public refresh (states?:RefreshFavoritesStates) :void {
		
		if (states?.favorites) this.favorites = states.favorites;
		if (states?.favoriteGroups) this.favoriteGroups = states.favoriteGroups;
		
		this._onDidChangeTreeData.fire(undefined);
		
	}
	
	public getTreeItem (element:FavoriteTreeItems) :FavoriteTreeItems {
		
		return element;
		
	}
	
	public getChildren (element?:FavoriteTreeItems) :Thenable<FavoriteTreeItems[]> {
		
		const list:FavoriteTreeItems[] = [];
		
		if (!this.favorites.length && !this.favoriteGroups.length) return Promise.resolve(list);
		
		if (element) {
			const groupId = (<FavoriteGroupTreeItem>element).favoriteGroup.id;
			this.favorites.filter((favorite) => favorite.groupId === groupId).forEach((favorite) => list.push(new FavoriteTreeItem(favorite)));
		} else {
			this.favoriteGroups.forEach((favoriteGroup) => list.push(new FavoriteGroupTreeItem(favoriteGroup)));
			this.favorites.filter((favorite) => favorite.groupId === undefined).forEach((favorite) => list.push(new FavoriteTreeItem(favorite)));
		}
		
		return Promise.resolve(list);
		
	}
	
}

//	Functions __________________________________________________________________

