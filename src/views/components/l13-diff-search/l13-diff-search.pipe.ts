//	Imports ____________________________________________________________________

import type { Diff, SearchCache } from '../../../types';

import type { L13DiffListPipe } from '../l13-diff-list/l13-diff-list.interface';

import type { L13DiffSearchViewModel } from './l13-diff-search.viewmodel';

//	Variables __________________________________________________________________

// eslint-disable-next-line no-useless-escape
const findRegExpChars = /([\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,])/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffSearchPipe implements L13DiffListPipe<Diff> {
	
	private cache:SearchCache = {
		searchterm: '',
		useRegExp: false,
		useCaseSensitive: false,
		useFiles: true,
		useFolders: true,
		useSymlinks: true,
		useConflicts: true,
		useOthers: true,
		regexp: null,
		items: [],
		filteredItems: [],
	};
	
	public constructor (public readonly vm:L13DiffSearchViewModel) {}
	
	public transform (items:Diff[]):Diff[] {
		
		const vm = this.vm;
		
		if (vm.disabled) return items;
		
		const cache = this.cache;
		const searchterm = vm.searchterm;
		const useRegExp = vm.useRegExp;
		const useCaseSensitive = vm.useCaseSensitive;
		const useFiles = vm.useFiles;
		const useFolders = vm.useFolders;
		const useSymlinks = vm.useSymlinks;
		const useConflicts = vm.useConflicts;
		const useOthers = vm.useOthers;
		
		if (items === cache.items
			&& cache.searchterm === searchterm
			&& cache.useRegExp === useRegExp
			&& cache.useCaseSensitive === useCaseSensitive
			&& cache.useFiles === useFiles
			&& cache.useFolders === useFolders
			&& cache.useSymlinks === useSymlinks
			&& cache.useConflicts === useConflicts
			&& cache.useOthers === useOthers
		) {
			return cache.filteredItems;
		}
		
		let regexp:RegExp = null;
		
		try {
			regexp = new RegExp(useRegExp ? searchterm : escapeForRegExp(searchterm), useCaseSensitive ? '' : 'i');
			vm.error = null;
		} catch (error) {
			vm.error = error.message;
			return items;
		}
		
		cache.items = items;
		cache.searchterm = searchterm;
		cache.useRegExp = useRegExp;
		cache.useCaseSensitive = useCaseSensitive;
		cache.useFiles = useFiles;
		cache.useFolders = useFolders;
		cache.useSymlinks = useSymlinks;
		cache.useConflicts = useConflicts;
		cache.useOthers = useOthers;
		
		return cache.filteredItems = items.filter((diff:Diff) => {
			
			if (useFiles && diff.type === 'file'
				|| useFolders && diff.type === 'folder'
				|| useSymlinks && diff.type === 'symlink'
				|| useConflicts && diff.type === 'mixed'
				|| useOthers && (diff.type === 'error' || diff.type === 'unknown')) {
				if (!searchterm) return true;
				const fileA = diff.fileA;
				const fileB = diff.fileB;
				return fileA && regexp.test(fileA.relative) || fileB && regexp.test(fileB.relative);
			}
			
			return false;
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

function escapeForRegExp (text:any) :string {
	
	return `${text}`.replace(findRegExpChars, '\\$1');
	
}