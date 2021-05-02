//	Imports ____________________________________________________________________

import { L13Component, L13Element } from '../../@l13/core';

import styles from '../styles';
import templates from '../templates';

import { L13DiffPanelViewModelService } from './l13-diff-panel.service';
import type { L13DiffPanelViewModel } from './l13-diff-panel.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-panel',
	service: L13DiffPanelViewModelService,
	styles: [styles['l13-diff-panel/l13-diff-panel.css']],
	template: templates['l13-diff-panel/l13-diff-panel.html'],
})
export class L13DiffPanelComponent extends L13Element<L13DiffPanelViewModel> {
	
	
	
}

//	Functions __________________________________________________________________

