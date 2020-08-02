//	Imports ____________________________________________________________________

import { DiffFile } from '../../@types/diffs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type WalkTreeOptions = {
	excludes?:string[],
	useCaseSensitive?:boolean,
};

export type StatsMap = {
	[pathname:string]:DiffFile,
};

export type WalkTreeJob = {
	error:null|Error,
	ignore:null|RegExp,
	tasks:number,
	result:StatsMap,
	done:(error?:Error) => void,
};

//	Functions __________________________________________________________________

