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
	
	@L13Query('#l13_resizer')
	private resizer:HTMLElement;
	
	@L13Query('#l13_searchterm')
	private inputSearchterm:HTMLInputElement;
	
	@L13Query('#l13_case_sensitive')
	private inputCaseSensitive:HTMLInputElement;
	
	@L13Query('#l13_use_regexp')
	private inputRegExp:HTMLInputElement;
	
	@L13Query('button')
	private button:HTMLButtonElement;
		
	private right:number = 0;
	
	private resizerOffsetX:number = 0;
	
	public constructor () {
		
		super();
		
		setLabelText(this.inputCaseSensitive, 'Match Case (⌥⌘C)');
		setLabelText(this.inputRegExp, 'Use Regular Expression (⌥⌘R)');
		setLabelText(this.button, 'Close (Escape)');
		
		this.inputRegExp.addEventListener('mouseup', () => this.inputSearchterm.focus());
		this.inputCaseSensitive.addEventListener('mouseup', () => this.inputSearchterm.focus());
		
		this.inputSearchterm.placeholder = 'Find';
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
		
		this.resizer.addEventListener('mousedown', this.resizeDown);
		
	}
		
	private resizeDown = (event:MouseEvent) => {
		
		document.body.classList.add('-unselectable');
		
		this.right = this.getBoundingClientRect().right;
		this.resizerOffsetX = event.offsetX;
		
		event.preventDefault();
		
		document.addEventListener('mousemove', this.resizeMove);
		document.addEventListener('mouseup', this.resizeUp);
		
	}
		
	private resizeMove = (event:MouseEvent) => {
		
		if (!event.which) return this.resizeUp();
		
		const width = this.right + this.resizerOffsetX - event.clientX;
		
		this.style.width = width + 'px';
		
	}
		
	private resizeUp = () => {
		
		document.removeEventListener('mousemove', this.resizeMove);
		document.removeEventListener('mouseup', this.resizeUp);
		
		document.body.classList.remove('-unselectable');
		
	}
	
	public focus () {
		
		this.inputSearchterm.focus();
		
	}
	
	public close () {
		
		this.viewmodel.clearSearchterm();
		this.remove();
		this.dispatchEvent(new CustomEvent('close'));
		
	}
	
}

//	Functions __________________________________________________________________

