//	Imports ____________________________________________________________________

import { L13Component, L13Element } from '../../@l13/core';

import { L13DiffPanelViewModelService } from './l13-diff-panel.service';
import { L13DiffPanelViewModel } from './l13-diff-panel.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

// const DISABLED = Symbol.for('disabled');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-panel',
	service: L13DiffPanelViewModelService,
	styles: [styles['l13-diff-panel/l13-diff-panel.css']],
	template: templates['l13-diff-panel/l13-diff-panel.html'],
})
export class L13DiffPanelComponent extends L13Element<L13DiffPanelViewModel> {
	
	// private [DISABLED]:boolean = false;
	
	// public get disabled () :boolean {
		
	// 	return this[DISABLED];
		
	// }
	
	// public set disabled (value:boolean) {
		
	// 	this[DISABLED] = value;
		
	// }
	
}

//	Functions __________________________________________________________________

