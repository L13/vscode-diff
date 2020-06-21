//	Imports ____________________________________________________________________

import { DiffFile } from '../../@types/diffs';
import { DiffCopyMessage, DiffInitMessage, DiffMultiCopyMessage } from '../../@types/messages';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type CopyFileEvent = {
	from:DiffFile,
	to:DiffFile,
};

export type CopyFilesEvent = {
	data:DiffCopyMessage,
	from:'A'|'B',
	to:'A'|'B',
};

export type MultiCopyEvent = {
	data:DiffMultiCopyMessage,
	from:'left'|'right',
};

export type StartEvent = {
	data:DiffInitMessage,
	pathA:string,
	pathB:string
};

//	Functions __________________________________________________________________

