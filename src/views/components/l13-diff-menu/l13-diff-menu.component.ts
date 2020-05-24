//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';
import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';

import { L13DiffMenuViewModelService } from './l13-diff-menu.service';
import { L13DiffMenuViewModel } from './l13-diff-menu.viewmodel';

import { removeChildren, scrollElementIntoView } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-menu',
	service: L13DiffMenuViewModelService,
	styles: [styles['l13-diff-menu/l13-diff-menu.css']],
	template: templates['l13-diff-menu/l13-diff-menu.html'],
})
export class L13DiffMenuComponent extends L13Element<L13DiffMenuViewModel> {
	
	@L13Query('l13-diff-menu-lists')
	private lists:HTMLElement;
		
	public isCursorInMenu = false;
		
	private listRecentlyUsed = document.createElement('UL');
	private listWorkspaces = document.createElement('UL');
		
	public constructor () {
	
		super();
		
		this.listRecentlyUsed.setAttribute('data-text', 'recently used');
		this.listWorkspaces.setAttribute('data-text', 'workspaces');
		
		this.addEventListener('mouseenter', () => this.isCursorInMenu = true);
		this.addEventListener('mouseleave', () => this.isCursorInMenu = false);
		
		this.lists.addEventListener('click', (event:Event) => {
			
			const target = <HTMLElement>event.target;
			const parentNode = this.parentNode;
			
			if (parentNode instanceof L13DiffInputComponent) {
				if (target.nodeName === 'LI') {
					parentNode.viewmodel.value = target.textContent;
					parentNode.focus();
					this.remove();
				} else parentNode.focus();
			}
			
		});
		
	}
	
	public update () {
		
		super.update();
		
		removeChildren(this.lists);
		
		if (this.viewmodel.history.length) {
			this.updateList(this.listRecentlyUsed, this.viewmodel.history);
			this.lists.appendChild(this.listRecentlyUsed);
		}
		
		if (this.viewmodel.workspaces.length) {
			this.updateList(this.listWorkspaces, this.viewmodel.workspaces);
			this.lists.appendChild(this.listWorkspaces);
		}
		
	}
	
	public updateList (list:HTMLElement, entries:string[]) {
		
		const fragment = document.createDocumentFragment();
		
		removeChildren(list);
		
		entries.forEach((entry) => {
			
			const item = document.createElement('LI');
			
			item.textContent = entry;
			
			fragment.appendChild(item);
			
		});
		
		list.appendChild(fragment);
		
	}

	public selectPrevious () {
		
		const listElements = this.lists.querySelectorAll('li');
		
		if (!listElements.length) return;
		
		const elementActive = this.lists.querySelector('.-active');
		
		if (elementActive) {
			if (listElements.length === 1) return;
			
			const index = Array.prototype.indexOf.call(listElements, elementActive);
			const elementPrevious = listElements[index - 1] || listElements[listElements.length - 1];
			
			scrollElementIntoView(this, elementPrevious);
			elementActive.classList.remove('-active');
			elementPrevious.classList.add('-active');
		} else listElements[listElements.length - 1].classList.add('-active');
		
	}
	
	public selectNext () {
		
		const listElements = this.lists.querySelectorAll('li');
		
		if (!listElements.length) return;
		
		const elementActive = this.lists.querySelector('.-active');
		
		if (elementActive) {
			if (listElements.length === 1) return;
			
			const index = Array.prototype.indexOf.call(listElements, elementActive);
			const elementNext = listElements[index + 1] || listElements[0];
			
			scrollElementIntoView(this, elementNext);
			elementActive.classList.remove('-active');
			elementNext.classList.add('-active');
		} else listElements[0].classList.add('-active');
		
	}
	
	public getSelection () :string {
		
		const elementActive = this.lists.querySelector('.-active');
		
		return elementActive ? elementActive.textContent : '';
		
	}
	
	public remove () {
		
		const elementActive = this.lists.querySelector('.-active');
		
		if (elementActive) elementActive.classList.remove('-active');
		
		super.remove();
		
		this.isCursorInMenu = false;
		
	}
	
}

//	Functions __________________________________________________________________

