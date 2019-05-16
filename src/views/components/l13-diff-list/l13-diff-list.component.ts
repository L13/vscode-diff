//	Imports ____________________________________________________________________

import { Diff, File } from '../../../types';
import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffListViewModelService } from './l13-diff-list.service';
import { L13DiffListViewModel } from './l13-diff-list.viewmodel';

import { L13DiffActionsViewModelService } from '../l13-diff-actions/l13-diff-actions.service';

import { isMacOs, isMetaKey, isOtherPlatform, isWindows, parseIcons, removeChildren, scrollElementIntoView, vscode } from '../common';
import styles from '../styles';
import templates from '../templates';

const slice = Array.prototype.slice;

//	Variables __________________________________________________________________

const actionsService = new L13DiffActionsViewModelService();

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-list',
	service: L13DiffListViewModelService,
	styles: [parseIcons(styles['l13-diff-list/l13-diff-list.css'])],
	template: templates['l13-diff-list/l13-diff-list.html'],
})
export class L13DiffListComponent extends L13Element<L13DiffListViewModel> {
	
	@L13Query('l13-diff-list-body')
	private list:HTMLElement;
	
	public disabled:boolean = false;
	
	public tabIndex = 0;
	
	private cacheSelectionHistory:HTMLElement[] = [];
	private cacheSelectedListItems:HTMLElement[] = [];
	private cacheListItemViews:{ [name:string]:HTMLElement } = {};
	private cacheListItems:Diff[] = [];
	private cacheFilteredListItems:Diff[] = [];
	
	public constructor () {
		
		super();
		
		window.addEventListener('focus', () => {
			
			if (this.cacheSelectionHistory.length) this.focus();
			
		});
		
		// this.addEventListener('focus', () => {
			
		// 	if (this.list.firstChild && !this.cacheSelectionHistory.length) {
		// 		this.selectFirst();
		// 		actionsService.model('actions').enableCopy();
		// 	}
			
		// });
		
		this.addEventListener('keydown', (event) => {
			
			if (this.disabled) return;
			
			switch (event.key) {
				case 'Enter':
					this.getIdsBySelection().forEach((id) => {
						
						vscode.postMessage({
							command: event.ctrlKey ? 'open:diffToSide' : 'open:diff',
							diff: this.viewmodel.getDiffById(id),
						});
						
					});
					break;
				case 'Escape':
					this.unselect();
					break;
				case 'ArrowUp':
					this.selectPrevious(event);
					event.preventDefault();
					break;
				case 'ArrowDown':
					this.selectNext(event);
					event.preventDefault();
					break;
			}
			
		});
		
		this.list.addEventListener('click', ({ target, metaKey, ctrlKey, shiftKey, offsetX }) => {
			
			if (this.disabled) return;
			
			if (this.list.firstChild && offsetX > (<HTMLElement>this.list.firstChild).offsetWidth) return;
			
			if (target === this.list) {
				this.unselect();
				return;
			}
			
			const parentNode = <HTMLElement>(<HTMLElement>target).parentNode;
			
			if (this.cacheSelectionHistory.length) {
			//	On macOS metaKey overrides shiftKey if both keys are pressed
				if (isMacOs && shiftKey && !metaKey || !isMacOs && shiftKey) {
					const lastSelection = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
					if (lastSelection) {
					//	On Windows selection works exactly like macOS if shiftKey and ctrlKey is pressed
					//	Otherwise Windows removes previous selection
						if (isWindows && !ctrlKey || isOtherPlatform) {
							this.unselect();
						//	On Windows previous selection will be remembered
						//	On Linux always last clicked item will be remembered
							this.cacheSelectionHistory = [isWindows ? lastSelection : parentNode];
						}
						if (this.cacheSelectedListItems.length) this.cacheSelectedListItems.forEach((element) => element.classList.remove('-selected'));
						this.cacheSelectedListItems = this.selectRange(parentNode, lastSelection);
					} else this.selectListItem(parentNode);
				} else if (isMetaKey(ctrlKey, metaKey)) {
					parentNode.classList.toggle('-selected');
					this.cacheSelectedListItems = [];
					if (parentNode.classList.contains('-selected')) this.cacheSelectionHistory.push(parentNode);
					else this.cacheSelectionHistory.splice(this.cacheSelectionHistory.indexOf(parentNode), 1);
					this.detectCopy();
				} else {
					this.unselect();
					this.selectListItem(parentNode);
				}
			} else this.selectListItem(parentNode);
			
		});
		
		this.list.addEventListener('dblclick', ({ target }) => {
			
			if (this.disabled) return;
			
			const id = (<HTMLElement>(<HTMLElement>target).parentNode).getAttribute('data-id');
			
			vscode.postMessage({
				command: 'open:diff',
				diff: this.viewmodel.getDiffById(id),
			});
			
		});
		
		document.addEventListener('mouseup', ({ target }) => {
			
			if (this.disabled) return;
			
			if (target !== document.documentElement && target !== document.body) return;
			
			this.unselect();
			
		});
		
	}
	
	private detectCopy () :void {
		
		if (this.cacheSelectionHistory.length) actionsService.model('actions').enableCopy();
		else actionsService.model('actions').disableCopy();
		
	}
	
	private selectListItem (parentNode:HTMLElement) {
	
		parentNode.classList.add('-selected');
		
		this.cacheSelectionHistory.push(parentNode);
		this.cacheSelectedListItems = [];
		
		actionsService.model('actions').enableCopy();
		
	}
	
	private selectRange (from:HTMLElement, to:HTMLElement) {
		
		if (from === to) {
			from.classList.add('-selected');
			return [from];
		}
		
		const elements = this.list.querySelectorAll('l13-diff-list-row');
		let useSelect = false;
		
		return slice.call(elements).filter((element) => {
								
			if (useSelect || element === from || element === to) {
				if (element === from || element === to) useSelect = !useSelect;
				element.classList.add('-selected');
				return true;
			}
			
		});
		
	}
	
	private selectFirst () {
		
		const element = <HTMLElement>this.list.querySelector('l13-diff-list-row');
		
		element.classList.add('-selected');
		
		this.cacheSelectionHistory.push(element);
		scrollElementIntoView(this, element);
		
		actionsService.model('actions').enableCopy();
		
	}
	
	private selectPrevious ({ altKey, shiftKey }:KeyboardEvent) {
		
		if (isMacOs) {
			if (!this.list.firstChild) return;
			
			const length = this.cacheSelectionHistory.length;
			const lastSelection = this.cacheSelectionHistory[length - 1];
			
			if (!lastSelection) return this.selectFirst();
			
			const previousElementSibling = <HTMLElement>lastSelection.previousElementSibling;
			
			if (!previousElementSibling) {
				if (!shiftKey && length > 1) {
					this.unselect();
					lastSelection.classList.add('-selected');
					this.cacheSelectionHistory.push(lastSelection);
				}
				scrollElementIntoView(this, lastSelection);
				actionsService.model('actions').enableCopy();
				return;
			}
			
			if (altKey) {
				const firstRow = <HTMLElement>this.list.querySelector('l13-diff-list-row');
				if (!shiftKey) {
					this.unselect();
					firstRow.classList.add('-selected');
				} else this.selectRange(firstRow, lastSelection);
				this.cacheSelectionHistory.push(firstRow);
				scrollElementIntoView(this, firstRow);
				actionsService.model('actions').enableCopy();
				return;
			}
			
			if (!shiftKey) this.unselect();
			
			this.cacheSelectionHistory.push(previousElementSibling);
			previousElementSibling.classList.add('-selected');
			
			scrollElementIntoView(this, previousElementSibling);
			actionsService.model('actions').enableCopy();
		}
		
	}
	
	private selectNext ({ altKey, shiftKey }:KeyboardEvent) {
		
		if (isMacOs) {
			if (!this.list.firstChild) return;
			
			const length = this.cacheSelectionHistory.length;
			const lastSelection = this.cacheSelectionHistory[length - 1];
			
			if (!lastSelection) return this.selectFirst();
			
			const nextElementSibling = <HTMLElement>lastSelection.nextElementSibling;
			
			if (!nextElementSibling) {
				if (!shiftKey && length > 1) {
					this.unselect();
					lastSelection.classList.add('-selected');
					this.cacheSelectionHistory.push(lastSelection);
				}
				scrollElementIntoView(this, lastSelection);
				actionsService.model('actions').enableCopy();
				return;
			}
			
			if (altKey) {
				const rows = this.list.querySelectorAll('l13-diff-list-row');
				const lastRow = <HTMLElement>rows[rows.length - 1];
				if (!shiftKey) {
					this.unselect();
					lastRow.classList.add('-selected');
				} else this.selectRange(lastSelection, lastRow);
				this.cacheSelectionHistory.push(lastRow);
				scrollElementIntoView(this, lastRow);
				actionsService.model('actions').enableCopy();
				return;
			}
			
			if (!shiftKey) this.unselect();
			
			this.cacheSelectionHistory.push(nextElementSibling);
			nextElementSibling.classList.add('-selected');
			
			scrollElementIntoView(this, nextElementSibling);
			actionsService.model('actions').enableCopy();
		}
		
	}
	
	public selectByStatus (type:string, addToSelection:boolean = false) {
		
		if (!addToSelection) this.unselect();
		
		const elements = this.list.querySelectorAll(`l13-diff-list-row.-${type}`);
		
		if (elements) elements.forEach((element) => element.classList.add('-selected'));
		
		this.detectCopy();
		
	}
	
	public unselect () {
		
		this.cacheSelectionHistory = [];
		
		const elements = this.list.querySelectorAll('.-selected');
	
		if (elements.length) elements.forEach((element) => element.classList.remove('-selected'));
		
		actionsService.model('actions').disableCopy();
		
	}
	
	private getIdsBySelection () :string[] {
		
		const elements = this.list.querySelectorAll('.-selected');
		const ids:string[] = [];
		
		elements.forEach((element) => ids.push(element.getAttribute('data-id')));
		
		return ids;
		
	}
	
	public copy (from:'left'|'right') :void {
		
		this.viewmodel.copy(from, this.getIdsBySelection());
		
	}
	
	public update () {
		
		super.update();
		
		if (this.viewmodel.items !== this.cacheListItems) this.createListItemViews();
		if (this.viewmodel.filteredItems !== this.cacheFilteredListItems) this.showFiteredListItemViews();
		
	}
	
	private createListItemViews () :void {
		
		this.cacheListItemViews = {};
		
		this.viewmodel.items.forEach((diff) => {
		
			const row = document.createElement('l13-diff-list-row');
			
			row.classList.add('-' + diff.status);
			row.setAttribute('data-id', '' + diff.id);
			
			appendColumn(row, <File>diff.fileA);
			appendColumn(row, <File>diff.fileB);
			
			this.cacheListItemViews[diff.id] = row;
			
		});
		
		this.cacheListItems = this.viewmodel.items;
		
	}
	
	private showFiteredListItemViews () {
		
		this.unselect();
		
		removeChildren(this.list);
		
		const fragment = document.createDocumentFragment();
		
		this.viewmodel.filteredItems.forEach((diff) => {
			
			fragment.appendChild(this.cacheListItemViews[diff.id]);
			
		});
		
		this.list.appendChild(fragment);
		
		this.cacheFilteredListItems = this.viewmodel.filteredItems;
		
	}
	
}

//	Functions __________________________________________________________________

function appendColumn (parent:HTMLElement, file:File) {
	
	const column = document.createElement('l13-diff-list-file');
	
	if (file) {
		column.classList.add(`-${file.type}`);
		column.textContent = file.relative;
	}
	
	parent.appendChild(column);
	
}