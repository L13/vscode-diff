//	Imports ____________________________________________________________________

import type { Diff, DiffSettings } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffResult {
	
	public diffs: Diff[] = [];
	
	public constructor (public pathA: string, public pathB: string, public settings: DiffSettings) {
		
		
		
	}
	
}

//	Functions __________________________________________________________________

