//	Imports ____________________________________________________________________

import * as fs from 'fs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Diff = {
	id:string,
	status:'conflicting'|'deleted'|'modified'|'unchanged'|'untracked',
	type:'file'|'folder'|'symlink'|'mixed',
	ignoredWhitespace:boolean,
	ignoredEOL:boolean,
	fileA:null|DiffFile,
	fileB:null|DiffFile,
};

export type DiffFile = {
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

//	Functions __________________________________________________________________

