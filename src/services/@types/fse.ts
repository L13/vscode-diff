//	Imports ____________________________________________________________________

import type { Dictionary, DiffFile } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type WalkTreeOptions = {
	abortOnError: boolean,
	excludes?: string[],
	useCaseSensitive?: boolean,
	maxFileSize?: number,
};

export type StatsMap = Dictionary<DiffFile>;

export type WalkTreeJob = {
	error: null | Error,
	abort: boolean,
	ignore: null | RegExp,
	tasks: number,
	result: StatsMap,
	maxSize: number,
	done: (error?: Error) => void,
};

//	Functions __________________________________________________________________

