//	Imports ____________________________________________________________________

import * as fs from 'fs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Diff = {
	id:string,
	status:'conflicting'|'deleted'|'ignored'|'modified'|'unchanged'|'untracked',
	type:'file'|'folder'|'symlink'|'mixed',
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
	type?:'file'|'folder'|'symlink',
};

//	Functions __________________________________________________________________

