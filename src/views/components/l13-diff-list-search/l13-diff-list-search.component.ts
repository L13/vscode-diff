//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffListSearchViewModelService } from './l13-diff-list-search.service';
import { L13DiffListSearchViewModel } from './l13-diff-list-search.viewmodel';

import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';

import { parseIcons, setLabelText } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-list-search',
	service: L13DiffListSearchViewModelService,
	styles: [parseIcons(styles['l13-diff-list-search/l13-diff-list-search.css'])],
	template: templates['l13-diff-list-search/l13-diff-list-search.html'],
})
export class L13DiffListSearchComponent extends L13Element<L13DiffListSearchViewModel> {
	
	@L13Query('button')
	private button:HTMLButtonElement;
	
	public left:L13DiffInputComponent;
	
	public right:L13DiffInputComponent;
	
	public constructor () {
		
		super();
		
		setLabelText(this.button, 'Swap left and right input fields');
		
		this.button.addEventListener('click', () => {
			
			const value = this.left.viewmodel.value;
			
			this.left.viewmodel.value = this.right.viewmodel.value;
			this.right.viewmodel.value = value;
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

