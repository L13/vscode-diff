//	Imports ____________________________________________________________________

import { Diff, File } from '../../../types';
import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffListViewModelService } from './l13-diff-list.service';
import { L13DiffListViewModel } from './l13-diff-list.viewmodel';

import { L13DiffActionsViewModelService } from '../l13-diff-actions/l13-diff-actions.service';

import { isMacOs ,isMetaKey, isOtherPlatform, isWindows, parseIcons, removeChildren, vscode } from '../common';
import styles from '../styles';
import templates from '../templates';

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
	
	private cacheSelectionHistory:HTMLElement[] = [];
	private cacheSelectedListItems:HTMLElement[] = [];
	private cacheListItemViews:{ [name:string]:HTMLElement } = {};
	private cacheListItems:Diff[] = [];
	private cacheFilteredListItems:Diff[] = [];
	
	public constructor () {
		
		super();
		
		this.list.addEventListener('click', ({ target, metaKey, ctrlKey, shiftKey, offsetX }) => {
	
			if (this.disabled) return;
			
			if (this.list.firstChild && offsetX > (<HTMLElement>this.list.firstChild).offsetWidth) return;
			
			if (target === this.list) {
				this.unselect();
				return;
			}
			
			const selected = this.list.querySelectorAll('.-selected');
			const parentNode = <HTMLElement>(<HTMLElement>target).parentNode;
			
			if (selected.length) {
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
						let useSelect = false;
						if (this.cacheSelectedListItems.length) this.cacheSelectedListItems.forEach((element) => element.classList.remove('-selected'));
						const elements = this.list.querySelectorAll('l13-diff-list-row');
						if (elements) {
							this.cacheSelectedListItems = Array.prototype.slice.call(elements).filter((element) => {
								
								if (useSelect || element === parentNode || element === lastSelection) {
									if (element === parentNode || element === lastSelection) useSelect = !useSelect;
									element.classList.add('-selected');
									return true;
								}
								
							});
						}
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
		
		if (this.list.querySelector('.-selected')) actionsService.model('actions').enableCopy();
		else actionsService.model('actions').disableCopy();
		
	}
	
	private selectListItem (parentNode:HTMLElement) {
	
		parentNode.classList.add('-selected');
		this.cacheSelectionHistory.push(parentNode);
		this.cacheSelectedListItems = [];
		actionsService.model('actions').enableCopy();
		
	}
	
	public select (type:string, addToSelection:boolean = false) {
		
		if (!addToSelection) this.unselect();
		
		const elements = this.list.querySelectorAll(`l13-diff-list-row.-${type}`);
		
		if (elements) elements.forEach((element) => element.classList.add('-selected'));
		
		this.detectCopy();
		
	}
	
	public unselect () {
		
		this.cacheSelectionHistory = [];
		
		const elements = this.list.querySelectorAll('.-selected');
	
		if (elements) elements.forEach((element) => element.classList.remove('-selected'));
		
		this.detectCopy();
		
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