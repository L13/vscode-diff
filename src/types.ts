//	Imports ____________________________________________________________________

import * as fs from 'fs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Callback = (error?:null|Error, result?:StatsMap) => void;

export type Comparison = {
	fileA:string,
	fileB:string,
	label:string,
	desc:string,
};

export type CopyFilesJob = {
	error:null|Error,
	tasks:number,
	done:(error?:Error) => void,
};

export type Dialog = {
	text:string,
	textSingle?:string,
	buttonAll:string,
	buttonLeft?:string,
	buttonRight?:string,
};

export type Dictionary<T> = { [token:string]:T };

export type DiffStats = {
	total:number,
	
	files:number,
	folders:number,
	symlinks:number,
	
	conflicting:number,
	deleted:number,
	modified:number,
	unchanged:number,
	untracked:number,
	
	eol:number,
};

export type Diff = {
	id:string,
	status:'conflicting'|'deleted'|'modified'|'unchanged'|'untracked',
	type:'file'|'folder'|'symlink'|'mixed',
	ignoredWhitespace:boolean,
	ignoredEOL:boolean,
	fileA:null|File,
	fileB:null|File,
};

export type Favorite = {
	fileA:string,
	fileB:string,
	label:string
};

export type File = {
	folder:string,
	path:string,
	relative:string,
	stat?:fs.Stats,
	name:string,
	basename:string,
	dirname:string,
	extname:string,
	type?:'file'|'folder'|'symlink',
};

export type MessageListener = (...args:any[]) => void;

export type Options = {
	ignore?:string[],
};

export type Plural = {
	size:string,
	[index:number]:string,
};

export type StatsMap = {
	[pathname:string]:File
};

export type TextFiles = {
	extensions:string[],
	filenames:string[],
	glob:RegExp,
};

export type Uri = {
	fsPath:string,
};

export type WalkTreeJob = {
	error:null|Error,
	ignore:null|RegExp,
	tasks:number,
	result:StatsMap,
	done:(error?:Error) => void,
};

//	Functions __________________________________________________________________

