//	Imports ____________________________________________________________________

import type { Diff } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type SearchCache = {
	searchterm:string,
	useRegExp:boolean,
	useCaseSensitive:boolean,
	useFiles:boolean,
	useFolders:boolean,
	useSymlinks:boolean,
	useConflicts:boolean,
	useOthers:boolean,
	regexp:RegExp,
	items:Diff[],
	filteredItems:Diff[],
};

//	Functions __________________________________________________________________

