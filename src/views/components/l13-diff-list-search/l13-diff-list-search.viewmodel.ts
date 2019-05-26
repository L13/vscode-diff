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
	regexp:RegExp,
	items:Diff[],
	filteredItems:Diff[],
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffListSearchViewModel extends ViewModel implements ListFilter {
	
	private cache:Cache = {
		searchterm: '',
		useRegExp: false,
		regexp: null,
		items: [],
		filteredItems: [],
	};
	
	public [SEARCHTERM]:string = '';
	
	public disabled:boolean = false;
	
	public useRegExp:boolean = false;
	
	public get searchterm () :string {
		
		return this[SEARCHTERM];
		
	}
	
	public set searchterm (value:string) {
		
		this[SEARCHTERM] = value;
		this.requestUpdate();
		
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
		
		if (items === cache.items
			&& cache.searchterm === searchterm
			&& cache.useRegExp === useRegExp
			) {
			return cache.filteredItems;
		}
		
		let regexp = cache.regexp;
		
		if (cache.searchterm !== searchterm || cache.useRegExp !== useRegExp) {
			cache.regexp = regexp = new RegExp(useRegExp ? searchterm : escapeForRegExp(searchterm));
		}
		
		cache.items = items;
		cache.searchterm = searchterm;
		cache.useRegExp = useRegExp;
		
		return cache.filteredItems = items.filter((diff:Diff) => regexp.test(diff.id));
		
	}
	
}

//	Functions __________________________________________________________________

function escapeForRegExp (text:any) :string {
	
	return ('' + text).replace(findRegExpChars, '\\$1');
	
}