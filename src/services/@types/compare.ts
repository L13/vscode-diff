//	Imports ____________________________________________________________________

import { DiffSettings } from '../../@types/diffs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Dictionary<T> = {
	[token:string]:T,
};

export type DiffError = {
	diffSettings?:DiffSettings,
	error:string|Error,
	pathA:string,
	pathB:string,
};

//	Functions __________________________________________________________________

