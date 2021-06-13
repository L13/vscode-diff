//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { addButtonActiveStyleEvents, disableContextMenu, parseIcons, setLabel } from '../../common';

import styles from '../styles';
import templates from '../templates';

import { L13DiffSwapViewModelService } from './l13-diff-swap.service';
import type { L13DiffSwapViewModel } from './l13-diff-swap.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-swap',
	service: L13DiffSwapViewModelService,
	styles: [parseIcons(styles['l13-diff-swap/l13-diff-swap.css'])],
	template: templates['l13-diff-swap/l13-diff-swap.html'],
})
export class L13DiffSwapComponent extends L13Element<L13DiffSwapViewModel> {
	
	@L13Query('button')
	public button:HTMLButtonElement;
	
	public constructor () {
		
		super();
		
		setLabel(this.button, 'Swap Paths');
		
		this.button.addEventListener('click', (event) => this.dispatchCustomEvent('swap', event));
		
		addButtonActiveStyleEvents(this.button);
		disableContextMenu(this);
		
	}
	
}

//	Functions __________________________________________________________________

