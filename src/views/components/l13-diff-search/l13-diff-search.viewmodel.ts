//	Imports ____________________________________________________________________

import type { SearchState } from '../../../types';

import { ViewModel } from '../../@l13/component/view-model.abstract';

//	Variables __________________________________________________________________

const SEARCHTERM = Symbol.for('searchterm');
const ERROR = Symbol.for('error');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSearchViewModel extends ViewModel {
	
	public disabled = false;
	
	public useRegExp = false;
	
	public useCaseSensitive = false;
	
	public useFiles = true;
	
	public useFolders = true;
	
	public useSymlinks = true;
	
	public useConflicts = true;
	
	public useOthers = true;
	
	private [SEARCHTERM] = '';
	
	public get searchterm () {
		
		return this[SEARCHTERM];
		
	}
	
	public set searchterm (value) {
		
		this[SEARCHTERM] = value;
		if (!value) this.error = null;
		this.requestUpdate();
		
	}
	
	private [ERROR]: null | string = '';
	
	public get error () {
		
		return this[ERROR];
		
	}
	
	public set error (value) {
		
		this[ERROR] = value;
		this.requestUpdate();
		
	}
	
	public clearSearchterm () {
		
		this.searchterm = '';
		
	}
	
	public disable (): Promise<undefined> {
		
		this.disabled = true;
		
		return this.requestUpdate();
		
	}
	
	public enable (): Promise<undefined> {
		
		this.disabled = false;
		
		return this.requestUpdate();
		
	}
	
	public getState (): SearchState {
		
		return {
			searchterm: this.searchterm,
			useRegExp: this.useRegExp,
			useCaseSensitive: this.useCaseSensitive,
			useFiles: this.useFiles,
			useFolders: this.useFolders,
			useSymlinks: this.useSymlinks,
			useConflicts: this.useConflicts,
			useOthers: this.useOthers,
		};
		
	}
	
	public setState (state: SearchState) {
		
		this.searchterm = state.searchterm;
		this.useRegExp = state.useRegExp;
		this.useCaseSensitive = state.useCaseSensitive;
		this.useFiles = state.useFiles;
		this.useFolders = state.useFolders;
		this.useSymlinks = state.useSymlinks;
		this.useConflicts = state.useConflicts;
		this.useOthers = state.useOthers ?? this.useOthers; // Fix for extension update
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

