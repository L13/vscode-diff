//	Imports ____________________________________________________________________

import type { DiffFile } from '../../../@types/diffs';

import { changePlatform, L13Component, L13Element, L13Query } from '../../@l13/core';

import { addButtonActiveStyleEvents, disableContextMenu, msg, parseIcons, setLabel } from '../../common';

import type { L13DiffMenuComponent } from '../l13-diff-menu/l13-diff-menu.component';

import styles from '../styles';
import templates from '../templates';

import { L13DiffInputViewModelService } from './l13-diff-input.service';
import type { L13DiffInputViewModel } from './l13-diff-input.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-input',
	service: L13DiffInputViewModelService,
	styles: [parseIcons(styles['l13-diff-input/l13-diff-input.css'])],
	template: templates['l13-diff-input/l13-diff-input.html'],
})
export class L13DiffInputComponent extends L13Element<L13DiffInputViewModel> {
	
	@L13Query('input')
	private input: HTMLInputElement;
	
	@L13Query('button')
	private button: HTMLInputElement;
	
	public menu: L13DiffMenuComponent;
	
	public focused = false;
	
	public constructor () {
		
		super();
		
		setLabel(this.button, 'Pick Folder (Click) or File (Alt + Click)');
		
		disableContextMenu(this.button);
		
		this.input.addEventListener('focus', async () => {
			
			const menu = this.menu;
			
			this.focused = true;
			msg.send('context', { name: 'l13DiffInputFocus', value: true });
			this.appendChild(menu);
			
		//	Weird focus blur switch if click is outside of panel view.
		//	Update of menu is async and should be done right after. Fixes it.
			await menu.viewmodel.update();
			
		});
		
		this.input.addEventListener('click', async () => {
			
			if (this.menu.parentNode === this) return;
			
			const menu = this.menu;
			
			this.focused = true;
			this.appendChild(menu);
			
		//	Weird focus blur switch if click is outside of panel view.
		//	Update of menu is async and should be done right after. Fixes it.
			await menu.viewmodel.update();
			
		});
			
		this.input.addEventListener('blur', () => {
			
			const menu = this.menu;
			
			this.focused = false;
			
			msg.send('context', { name: 'l13DiffInputFocus', value: false });
			
			if (!menu.isCursorInMenu && menu.parentNode === this) menu.remove();
			
		});
		
		this.input.addEventListener('keydown', ({ key, metaKey, ctrlKey, altKey, shiftKey }) => {
			
			const menu = this.menu;
			
			switch (key) {
				case 'F12': // Debug Mode
					if (metaKey && ctrlKey && altKey && shiftKey) changePlatform();
					break;
				case 'Enter':
					if (menu) {
						if (menu.parentNode) {
							const value = menu.getSelection();
							if (value) this.viewmodel.value = value;
							menu.remove();
						} else this.dispatchCustomEvent('compare');
					}
					break;
				case 'Tab':
					if (menu && menu.parentNode) menu.remove();
					break;
				case 'ArrowUp':
					if (menu && !menu.parentNode) this.appendChild(menu);
					menu.selectPrevious();
					break;
				case 'ArrowDown':
					if (menu && !menu.parentNode) this.appendChild(menu);
					menu.selectNext();
					break;
			}
			
		});
		
		this.input.addEventListener('dragenter', () => {
			
			this.input.setAttribute('data-value', this.input.value);
			this.viewmodel.value = '';
			
		});
		
		this.input.addEventListener('dragleave', () => {
			
			this.viewmodel.value = this.input.getAttribute('data-value') || '';
			this.input.removeAttribute('data-value');
			
		});
		
		this.input.addEventListener('dragover', (event) => event.preventDefault());
		
		this.input.addEventListener('drop', ({ dataTransfer }: DragEvent) => {
			
			this.input.removeAttribute('data-value');
			
			if (dataTransfer) {
				if (dataTransfer.files[0]) {
					this.viewmodel.value = (<any>dataTransfer.files[0]).path;
				} else {
					const file = dataTransfer.getData('data-diff-file');
					if (file) this.viewmodel.value = (<DiffFile>JSON.parse(file)).fsPath;
				}
			}
			
		});
		
		addButtonActiveStyleEvents(this.button);
		
		this.button.addEventListener('click', (event: MouseEvent) => {
			
			this.viewmodel.pick(event.altKey);
			
		});
		
	}
	
	public focus () {
		
		this.input.focus();
		
	}
	
	public connectedCallback () {
		
		super.connectedCallback();
		
		if (!this.input.placeholder) this.input.placeholder = this.getAttribute('placeholder');
		
	}
	
}

//	Functions __________________________________________________________________

