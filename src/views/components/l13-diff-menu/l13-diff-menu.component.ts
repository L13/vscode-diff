//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { disableContextMenu, removeChildren, scrollElementIntoView, setLabel } from '../../common';

import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';

import styles from '../styles';
import templates from '../templates';

import { L13DiffMenuViewModelService } from './l13-diff-menu.service';
import type { L13DiffMenuViewModel } from './l13-diff-menu.viewmodel';

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
	private lists: HTMLElement;

	public isCursorInMenu = false;

	private listRecentlyUsed = document.createElement('UL');
	private listWorkspaces = document.createElement('UL');

	public constructor () {

		super();
		
		disableContextMenu(this);

		this.addEventListener('mouseenter', () => this.isCursorInMenu = true);
		this.addEventListener('mouseleave', () => this.isCursorInMenu = false);

		this.lists.addEventListener('click', (event: Event) => {

			const item = (<HTMLElement>event.target).closest('li');
			const parentNode = this.parentNode;

			if (parentNode instanceof L13DiffInputComponent) {
				parentNode.viewmodel.value = item.firstElementChild.textContent;
				parentNode.focus();
				this.remove();
			}

		});

	}

	public update () {

		super.update();

		removeChildren(this.lists);

		if (this.viewmodel.history.length) {
			this.updateList(this.listRecentlyUsed, this.viewmodel.history, 'recently used');
			this.lists.appendChild(this.listRecentlyUsed);
		}

		if (this.viewmodel.workspaces.length) {
			this.updateList(this.listWorkspaces, this.viewmodel.workspaces, 'workspaces');
			this.lists.appendChild(this.listWorkspaces);
		}

	}

	public updateList (list: HTMLElement, entries: string[], info: string) {

		const fragment = document.createDocumentFragment();

		removeChildren(list);

		entries.forEach((entry, index) => {

			const item = document.createElement('LI');
			const path = document.createElement('DIV');
			
			path.classList.add('-path');
			path.textContent = entry;
			item.appendChild(path);
			setLabel(item, entry);
			
			if (index === 0) {
				const description = document.createElement('DIV');
				description.classList.add('-info');
				description.textContent = info;
				item.appendChild(description);
			}

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

	public getSelection () {

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

