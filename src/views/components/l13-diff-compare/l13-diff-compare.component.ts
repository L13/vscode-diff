//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffListComponent } from '../l13-diff-list/l13-diff-list.component';
import { L13DiffCompareViewModelService } from './l13-diff-compare.service';
import { L13DiffCompareViewModel } from './l13-diff-compare.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-compare',
	service: L13DiffCompareViewModelService,
	styles: [styles['l13-diff-compare/l13-diff-compare.css']],
	template: templates['l13-diff-compare/l13-diff-compare.html'],
})
export class L13DiffCompareComponent extends L13Element<L13DiffCompareViewModel> {
	
	@L13Query('button')
	private button:HTMLButtonElement;
	
	public list:L13DiffListComponent;
	
	public constructor () {
		
		super();
		
		this.button.addEventListener('click', () => this.list.viewmodel.compare());
		
	}
	
}

//	Functions __________________________________________________________________

