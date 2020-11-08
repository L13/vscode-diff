//	Imports ____________________________________________________________________

import { Diff, DiffFile } from './diffs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type DiffCopyMessage = {
	diffs:Diff[],
	multi:boolean,
	pathA:string,
	pathB:string,
};

export type DiffDialogMessage = {
	fsPath:string,
};

export type DiffGoToMessage = {
	files:DiffFile[],
	openToSide:boolean,
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

export type DiffOpenMessage = {
	diffs:Diff[],
	pathA:string,
	pathB:string,
	openToSide:boolean,
};

export type MessageListener = (...args:any[]) => void;

//	Functions __________________________________________________________________

