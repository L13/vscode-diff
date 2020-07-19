//	Imports ____________________________________________________________________

import { DiffFile } from '../../@types/diffs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Callback = (error?:null|Error, result?:StatsMap) => void;

export type WalkTreeOptions = {
	ignore?:string[],
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

