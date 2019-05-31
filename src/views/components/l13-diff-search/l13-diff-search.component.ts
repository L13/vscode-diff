//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffSearchViewModelService } from './l13-diff-search.service';
import { L13DiffSearchViewModel } from './l13-diff-search.viewmodel';

import { isMetaKey, parseIcons, setLabelText } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-search',
	service: L13DiffSearchViewModelService,
	styles: [parseIcons(styles['l13-diff-search/l13-diff-search.css'])],
	template: templates['l13-diff-search/l13-diff-search.html'],
})
export class L13DiffSearchComponent extends L13Element<L13DiffSearchViewModel> {
	
	@L13Query('#l13_searchterm')
	private inputSearchterm:HTMLInputElement;
	
	@L13Query('#l13_case_sensitive')
	private inputCaseSensitive:HTMLInputElement;
	
	@L13Query('#l13_use_regexp')
	private inputRegExp:HTMLInputElement;
	
	@L13Query('button')
	private button:HTMLButtonElement;
	
	public constructor () {
		
		super();
		
		setLabelText(this.inputCaseSensitive, 'Match Case (⌥⌘C)');
		setLabelText(this.inputRegExp, 'Use Regular Expression (⌥⌘R)');
		setLabelText(this.button, 'Close (Escape)');
		
		this.inputSearchterm.addEventListener('keydown', ({ key, keyCode, metaKey, ctrlKey, altKey }) => {
			
			switch (key) {
				case 'Escape':
					this.close();
					break;
				default:
					if (isMetaKey(ctrlKey, metaKey) && altKey) {
						switch (keyCode) {
							case 67: // c
								this.inputCaseSensitive.checked = !this.inputCaseSensitive.checked;
								break;
							case 82: // r
								this.inputRegExp.checked = !this.inputRegExp.checked;
								break;
						}
					}
			}
			
		});
		
		this.button.addEventListener('click', () => this.close());
		
	}
	
	public close () {
		
		this.viewmodel.clearSearchterm();
		
	}
	
}

//	Functions __________________________________________________________________

