//	Imports ____________________________________________________________________

import { Diff } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type ViewsCache = {
	unchangedChecked:boolean,
	deletedChecked:boolean,
	modifiedChecked:boolean,
	untrackedChecked:boolean,
	items:Diff[],
	filteredItems:Diff[],
};

//	Functions __________________________________________________________________

