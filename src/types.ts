//	Imports ____________________________________________________________________

import * as fs from 'fs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Callback = (error?:null|Error, result?:StatsMap) => void;

export type Dictionary<T> = { [token:string]:T };

export type DiffResult = {
	pathA:string,
	pathB:string,
	total:number,
	diffs:Diff[],
};

export type Diff = {
	id:string,
	status:'deleted'|'modified'|'unchanged'|'untracked',
	type:'file'|'folder'|'link'|'mixed',
	fileA:null|File,
	fileB:null|File,
};

export type File = {
	path:string,
	folder:string,
	relative:string,
	stat?:fs.Stats,
	type?:'file'|'folder'|'link',
};

export type WalkTreeJob = {
	error:null|Error,
	ignore:null|RegExp,
	tasks:number,
	result:StatsMap,
	done:(error?:Error) => void,
};

export type CopyFilesJob = {
	error:null|Error,
	tasks:number,
	done:(error?:Error) => void,
};

export type Options = {
	ignore?:string[],
};

export type StatsMap = { [pathname:string]:File };

export type Uri = {
	fsPath:string,
};

//	Functions __________________________________________________________________

