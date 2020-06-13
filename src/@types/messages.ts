//	Imports ____________________________________________________________________

import { Diff } from './diffs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type DiffCopyMessage = {
	diffs:Diff[],
	multi:boolean,
	pathA:string,
	pathB:string,
};

export type DiffInitMessage = {
	pathA:string,
	pathB:string,
};

export type DiffMultiCopyMessage = {
	ids:string[],
	pathA:string,
	pathB:string,
};

export type DiffResultMessage = {
	diffs:Diff[],
	pathA:string,
	pathB:string,
};

export type MessageListener = (...args:any[]) => void;

//	Functions __________________________________________________________________

