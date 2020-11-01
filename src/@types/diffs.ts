//	Imports ____________________________________________________________________

import * as fs from 'fs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Diff = {
	id:string,
	status:DiffStatus,
	type:'error'|'file'|'folder'|'mixed'|'symlink'|'unknown',
	ignoredWhitespace:boolean,
	ignoredEOL:boolean,
	fileA:null|DiffFile,
	fileB:null|DiffFile,
};

export type DiffFile = {
	root:string,
	relative:string,
	fsPath:string,
	stat?:fs.Stats,
	path:string,
	name:string,
	basename:string,
	dirname:string,
	extname:string,
	ignore:boolean,
	type?:'error'|'file'|'folder'|'symlink'|'unknown',
};

export type DiffStatus = 'conflicting'|'deleted'|'ignored'|'modified'|'unchanged'|'untracked';

//	Functions __________________________________________________________________

