//	Imports ____________________________________________________________________

import { L13Component, L13Element } from '../../@l13/core';

import { L13DiffToolsViewModelService } from './l13-diff-tools.service';
import { L13DiffToolsViewModel } from './l13-diff-tools.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-tools',
	service: L13DiffToolsViewModelService,
	styles: [styles['l13-diff-tools/l13-diff-tools.css']],
	template: templates['l13-diff-tools/l13-diff-tools.html'],
})
export class L13DiffActionsComponent extends L13Element<L13DiffToolsViewModel> {
	
	
	
}

//	Functions __________________________________________________________________

