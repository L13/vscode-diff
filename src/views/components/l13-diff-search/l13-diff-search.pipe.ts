//	Imports ____________________________________________________________________

import { L13DiffListPipe } from '../l13-diff-list/l13-diff-list.interface';

import { L13DiffSearchViewModelService } from './l13-diff-search.service';
import { L13DiffSearchViewModel } from './l13-diff-search.viewmodel';

import { Diff } from '../../../types';

//	Variables __________________________________________________________________

type Cache = {
	searchterm:string,
	useRegExp:boolean,
	useCaseSensitive:boolean,
	useFiles:boolean,
	useFolders:boolean,
	regexp:RegExp,
	items:Diff[],
	filteredItems:Diff[],
};

const findRegExpChars:RegExp = /([\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,])/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSearchPipe implements L13DiffListPipe<Diff> {
	
	public vm:L13DiffSearchViewModel = null;
	
	private cache:Cache = {
		searchterm: '',
		useRegExp: false,
		useCaseSensitive: false,
		useFiles: true,
		useFolders: true,
		regexp: null,
		items: [],
		filteredItems: [],
	};
	
	public constructor (vmOrVmId:string|L13DiffSearchViewModel) {
		
		this.vm = typeof vmOrVmId === 'string' ? new L13DiffSearchViewModelService().model(vmOrVmId) : vmOrVmId;
		
	}
	
	public transform (items:Diff[]) :Diff[] {
		
		const vm = this.vm;
		
		if (vm.disabled) return items;
		
		const cache = this.cache;
		const searchterm = vm.searchterm;
		const useRegExp = vm.useRegExp;
		const useCaseSensitive = vm.useCaseSensitive;
		const useFiles = vm.useFiles;
		const useFolders = vm.useFolders;
		
		if (items === cache.items
			&& cache.searchterm === searchterm
			&& cache.useRegExp === useRegExp
			&& cache.useCaseSensitive === useCaseSensitive
			&& cache.useFiles === useFiles
			&& cache.useFolders === useFolders
			) {
			return cache.filteredItems;
		}
		
		let regexp = cache.regexp;
		
		try {
			cache.regexp = regexp = new RegExp(useRegExp ? searchterm : escapeForRegExp(searchterm), useCaseSensitive ? '' : 'i');
			vm.error = null;
		} catch (error) {
			vm.error = error.message;
		}
		
		cache.items = items;
		cache.searchterm = searchterm;
		cache.useRegExp = useRegExp;
		cache.useCaseSensitive = useCaseSensitive;
		cache.useFiles = useFiles;
		cache.useFolders = useFolders;
		
		return cache.filteredItems = items.filter((diff:Diff) => {
			
			if (useFiles && diff.type === 'file' || useFolders && diff.type === 'folder') return regexp.test(diff.id);
			
			return false;
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

function escapeForRegExp (text:any) :string {
	
	return ('' + text).replace(findRegExpChars, '\\$1');
	
}