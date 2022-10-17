//	Imports ____________________________________________________________________

import type { Diff } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type ViewsCache = {
	unchangedChecked: boolean,
	deletedChecked: boolean,
	modifiedChecked: boolean,
	untrackedChecked: boolean,
	ignoredChecked: boolean,
	items: Diff[],
	filteredItems: Diff[],
};

//	Functions __________________________________________________________________

