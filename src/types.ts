//	Imports ____________________________________________________________________

import * as fs from 'fs';

import { Event } from './views/@l13/events/event.class';

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
	buttonOk?:string,
};

export type Dictionary<T> = {
	[token:string]:T,
};

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

export type EventListener = (event?:Event, ...args:any[]) => void;

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

export type Keybinding = {
	title?:string,
	key:string,
	mac?:string,
	win?:string,
};

export type MessageListener = (...args:any[]) => void;

export type Options = {
	ignore?:string[],
};

export type Plural = {
	size:string,
	[index:number]:string,
};

export type SearchState = {
	searchterm:string,
	useRegExp:boolean,
	useCaseSensitive:boolean,
	useFiles:boolean,
	useFolders:boolean,
	useSymlinks:boolean,
	useConflicts:boolean,
};

export type Shortcut = {
	key:string,
	altKey:boolean,
	ctrlKey:boolean,
	metaKey:boolean,
	shiftKey:boolean,
};

export type SimpleMap = {
	[code:string]:string,
};

export type StatsMap = {
	[pathname:string]:File,
};

export type Test = {
	desc:string,
	expect:any,
	toBe:any,
};

export type TextFiles = {
	extensions:string[],
	filenames:string[],
	glob:RegExp,
};

export type Uri = {
	fsPath:string,
};

export type ViewsState = {
	unchangedChecked:boolean,
	deletedChecked:boolean,
	modifiedChecked:boolean,
	untrackedChecked:boolean,
};

export type WalkTreeJob = {
	error:null|Error,
	ignore:null|RegExp,
	tasks:number,
	result:StatsMap,
	done:(error?:Error) => void,
};

//	Functions __________________________________________________________________

