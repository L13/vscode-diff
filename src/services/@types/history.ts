//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Comparison = {
	fileA:string,
	fileB:string,
	label:string,
	desc:string,
};

export type HistoryStates = {
	comparisons:Comparison[],
};

export type RefreshHistoryStates = {
	comparisons?:Comparison[],
};

//	Functions __________________________________________________________________

