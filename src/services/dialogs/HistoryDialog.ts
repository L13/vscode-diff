//	Imports ____________________________________________________________________

import type { Comparison } from '../../types';

import * as dialogs from '../common/dialogs';

import type { HistoryState } from '../states/HistoryState';
import type { MenuState } from '../states/MenuState';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class HistoryDialog {
	
	private static current: HistoryDialog = null;
	
	public static create (historyState: HistoryState, menuState: MenuState) {
		
		return HistoryDialog.current || (HistoryDialog.current = new HistoryDialog(historyState, menuState));
		
	}
	
	private constructor (private readonly historyState: HistoryState, private readonly menuState: MenuState) {}
	
	public async remove (comparison: Comparison) {
		
		const text = `Delete comparison '${`${comparison.label}${comparison.desc ? ` (${comparison.desc})` : ''}`}'?`;
		
		if (await dialogs.confirm(text, 'Delete')) {
			this.historyState.remove(comparison);
		}
		
	}
	
	public async clear () {
		
		if (await dialogs.confirm('Delete the complete history?', 'Delete')) {
			this.menuState.clear();
			this.historyState.clear();
		}
		
	}
	
}

//	Functions __________________________________________________________________

