//	Imports ____________________________________________________________________

import { Diff } from '../../../types';
import { ViewModel } from '../../@l13/component/view-model.abstract';
import { ListFilter } from '../l13-diff-list/l13-diff-list.interface';

//	Variables __________________________________________________________________

const findRegExpChars:RegExp = /([\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,])/g;

const SEARCHTERM = Symbol.for('searchterm');

type Cache = {
	searchterm:string,
	useRegExp:boolean,
	useCaseSensitive:boolean,
	regexp:RegExp,
	items:Diff[],
	filteredItems:Diff[],
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSearchViewModel extends ViewModel implements ListFilter {
	
	private cache:Cache = {
		searchterm: '',
		useRegExp: false,
		useCaseSensitive: false,
		regexp: null,
		items: [],
		filteredItems: [],
	};
	
	public disabled:boolean = false;
	
	public useRegExp:boolean = false;
	
	public useCaseSensitive:boolean = false;
	
	private [SEARCHTERM]:string = '';
	
	public get searchterm () {
		
		return this[SEARCHTERM];
		
	}
	
	public set searchterm (val) {
		
		this[SEARCHTERM] = val;
		this.requestUpdate();
		
	}
	
	public clearSearchterm () {
		
		this.searchterm = '';
		
	}
	
	public disable () :void {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () :void {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	public filter (items:Diff[]) :Diff[] {
		
		if (!this.searchterm) return items;
		
		const cache = this.cache;
		const searchterm = this.searchterm;
		const useRegExp = this.useRegExp;
		const useCaseSensitive = this.useCaseSensitive;
		
		if (items === cache.items
			&& cache.searchterm === searchterm
			&& cache.useRegExp === useRegExp
			&& cache.useCaseSensitive === useCaseSensitive
			) {
			return cache.filteredItems;
		}
		
		let regexp = cache.regexp;
		
		try {
			cache.regexp = regexp = new RegExp(useRegExp ? searchterm : escapeForRegExp(searchterm), useCaseSensitive ? '' : 'i');
		} catch (error) {
			//
		}
		
		cache.items = items;
		cache.searchterm = searchterm;
		cache.useRegExp = useRegExp;
		cache.useCaseSensitive = useCaseSensitive;
		
		return cache.filteredItems = items.filter((diff:Diff) => regexp.test(diff.id));
		
	}
	
}

//	Functions __________________________________________________________________

function escapeForRegExp (text:any) :string {
	
	return ('' + text).replace(findRegExpChars, '\\$1');
	
}