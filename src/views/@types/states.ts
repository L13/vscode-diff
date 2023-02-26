//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type SearchState = {
	searchterm: string,
	useRegExp: boolean,
	useCaseSensitive: boolean,
	useFiles: boolean,
	useFolders: boolean,
	useSymlinks: boolean,
	useConflicts: boolean,
	useOthers: boolean,
};

export type ViewsState = {
	unchangedChecked: boolean,
	deletedChecked: boolean,
	modifiedChecked: boolean,
	untrackedChecked: boolean,
	ignoredChecked: boolean,
};

//	Functions __________________________________________________________________

