//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Comparison = {
	fileA: string,
	fileB: string,
	label: string,
	desc: string,
	type: 'file' | 'folder' | 'symlink',
};

export type HistoryStates = {
	comparisons: Comparison[],
};

export type RefreshHistoryStates = {
	comparisons?: Comparison[],
};

//	Functions __________________________________________________________________

