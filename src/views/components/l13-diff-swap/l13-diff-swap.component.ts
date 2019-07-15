//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query, setLabel } from '../../@l13/core';

import { L13DiffSwapViewModelService } from './l13-diff-swap.service';
import { L13DiffSwapViewModel } from './l13-diff-swap.viewmodel';

import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';

import { parseIcons } from '../common';
import styles from '../styles';
import templates from '../templates';

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
		
		setLabel(this.button, 'Swap left and right input fields');
		
		this.button.addEventListener('click', () => this.dispatchCustomEvent('swap'));
		
	}
	
}

//	Functions __________________________________________________________________

