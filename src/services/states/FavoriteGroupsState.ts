//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/arrays';

import type { FavoriteGroup } from '../../types';

import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoriteGroupsState {
	
	private static current: FavoriteGroupsState = null;
	
	public static create (context: vscode.ExtensionContext) {
		
		return FavoriteGroupsState.current || (FavoriteGroupsState.current = new FavoriteGroupsState(context));
		
	}
	
	private constructor (private readonly context: vscode.ExtensionContext) {}
	
	private _onDidChangeFavoriteGroups: vscode.EventEmitter<FavoriteGroup[]> = new vscode.EventEmitter<FavoriteGroup[]>();
	public readonly onDidChangeFavoriteGroups: vscode.Event<FavoriteGroup[]> = this._onDidChangeFavoriteGroups.event;
	
	public get () {
		
		return states.getFavoriteGroups(this.context);
		
	}
	
	private save (favoriteGroups: FavoriteGroup[]) {
		
		states.updateFavoriteGroups(this.context, favoriteGroups);
		
	}
	
	public getByName (label: string) {
		
		return this.get().find((favoriteGroup) => favoriteGroup.label === label) || null;
		
	}
	
	public add (label: string) {
		
		const favoriteGroups = this.get();
		
		if (favoriteGroups.some((favoriteGroup) => favoriteGroup.label === label)) return;
		
		favoriteGroups.push({ label, id: getNextGroupId(favoriteGroups), collapsed: false });
		favoriteGroups.sort(({ label: a }, { label: b }) => sortCaseInsensitive(a, b));
		
		this.save(favoriteGroups);
		this._onDidChangeFavoriteGroups.fire(favoriteGroups);
		
	}
	
	public rename (favoriteGroup: FavoriteGroup, label: string) {
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		const groupId = favoriteGroup.id;
		
		for (const group of favoriteGroups) {
			if (group.id === groupId) {
				group.label = label;
				favoriteGroups.sort(({ label: a }, { label: b }) => sortCaseInsensitive(a, b));
				this.save(favoriteGroups);
				this._onDidChangeFavoriteGroups.fire(favoriteGroups);
				break;
			}
		}
		
	}
	
	public import (label: string) {
		
		let group = this.getByName(label);
						
		if (!group) {
			const favoriteGroups = this.get();
			
			group = { label, id: getNextGroupId(favoriteGroups), collapsed: false };
			
			favoriteGroups.push({ label, id: getNextGroupId(favoriteGroups), collapsed: false });
			favoriteGroups.sort(({ label: a }, { label: b }) => sortCaseInsensitive(a, b));
			
			this.save(favoriteGroups);
		}
		
		return group;
		
	}
	
	public remove (favoriteGroup: FavoriteGroup, removeItems: boolean) {
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		const groupId = favoriteGroup.id;
		
		for (let i = 0; i < favoriteGroups.length; i++) {
			if (favoriteGroups[i].id === groupId) {
				favoriteGroups.splice(i, 1);
				this.save(favoriteGroups);
				let favorites = states.getFavorites(this.context);
				if (removeItems) {
					favorites = favorites.filter((favorite) => favorite.groupId !== groupId);
				} else {
					for (const favorite of favorites) {
						if (favorite.groupId === groupId) delete favorite.groupId;
					}
				}
				states.updateFavorites(this.context, favorites);
				this._onDidChangeFavoriteGroups.fire(favoriteGroups);
				break;
			}
		}
		
	}
	
	public saveCollapseState (favoriteGroup: FavoriteGroup, collapsed: boolean) {
		
		const favoriteGroups = states.getFavoriteGroups(this.context);
		const groupId = favoriteGroup.id;
		
		favoriteGroups.some((group) => group.id === groupId ? (group.collapsed = collapsed) || true : false);
		
		states.updateCollapseState(this.context, favoriteGroups);
		
	}
	
}

//	Functions __________________________________________________________________

function getNextGroupId (favoriteGroups: FavoriteGroup[]): number {
	
	if (!favoriteGroups.length) return 0;
	
	const groupIds = favoriteGroups.map((favoriteGroup) => favoriteGroup.id);
	const maxGroupId = Math.max.apply(null, groupIds);
	let i = 0;
	
	while (i <= maxGroupId) {
		if (!groupIds.includes(i)) return i;
		i++;
	}
	
	return i;
	
}