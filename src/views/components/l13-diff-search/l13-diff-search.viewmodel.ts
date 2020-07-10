//	Imports ____________________________________________________________________

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { SearchState } from '../../../types';

//	Variables __________________________________________________________________

const SEARCHTERM = Symbol.for('searchterm');
const ERROR = Symbol.for('error');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSearchViewModel extends ViewModel {
	
	public disabled:boolean = false;
	
	public useRegExp:boolean = false;
	
	public useCaseSensitive:boolean = false;
	
	public useFiles:boolean = true;
	
	public useFolders:boolean = true;
	
	public useSymlinks:boolean = true;
	
	public useConflicts:boolean = true;
	
	private [SEARCHTERM]:string = '';
	
	public get searchterm () {
		
		return this[SEARCHTERM];
		
	}
	
	public set searchterm (value) {
		
		this[SEARCHTERM] = value;
		if (!value) this.error = null;
		this.requestUpdate();
		
	}
	
	private [ERROR]:null|string = '';
	
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
	
	public disable () :Promise<any> {
		
		this.disabled = true;
		
		return this.requestUpdate();
		
	}
	
	public enable () :Promise<any> {
		
		this.disabled = false;
		
		return this.requestUpdate();
		
	}
	
	public getState () :SearchState {
		
		return {
			searchterm: this.searchterm,
			useRegExp: this.useRegExp,
			useCaseSensitive: this.useCaseSensitive,
			useFiles: this.useFiles,
			useFolders: this.useFolders,
			useSymlinks: this.useSymlinks,
			useConflicts: this.useConflicts,
		};
		
	}
	
	public setState (state:SearchState) :void {
		
		this.searchterm = state.searchterm;
		this.useRegExp = state.useRegExp;
		this.useCaseSensitive = state.useCaseSensitive;
		this.useFiles = state.useFiles;
		this.useFolders = state.useFolders;
		this.useSymlinks = state.useSymlinks;
		this.useConflicts = state.useConflicts;
		
		this.requestUpdate();
		
	}
	
}

//	Functions __________________________________________________________________

