//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffIntroViewModelService } from './l13-diff-intro.service';
import { L13DiffIntroViewModel } from './l13-diff-intro.viewmodel';

import { parseIcons } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-intro',
	service: L13DiffIntroViewModelService,
	styles: [parseIcons(styles['l13-diff-intro/l13-diff-intro.css'])],
	template: templates['l13-diff-intro/l13-diff-intro.html'],
})
export class L13DiffIntroComponent extends L13Element<L13DiffIntroViewModel> {
	
	public constructor () {
		
		super();
		
	}
	
}

//	Functions __________________________________________________________________

