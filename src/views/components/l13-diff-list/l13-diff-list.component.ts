//	Imports ____________________________________________________________________

import type { Diff, DiffFile, DiffOpenMessage, DiffStatus } from '../../../types';

import { remove } from '../../../@l13/arrays';
import { formatDate, formatFileSize } from '../../../@l13/formats';

import { changePlatform, isLinux, isMacOs, isWindows, L13Component, L13Element, L13Query } from '../../@l13/core';

import { isMetaKey, msg, parseIcons, removeChildren, scrollElementIntoView } from '../../common';
import { Direction } from '../../enums';

import type { L13DiffContextComponent } from '../l13-diff-context/l13-diff-context.component';

import styles from '../styles';
import templates from '../templates';

import { L13DiffListViewModelService } from './l13-diff-list.service';
import type { L13DiffListViewModel } from './l13-diff-list.viewmodel';

//	Variables __________________________________________________________________

const { PREVIOUS, NEXT } = Direction;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-list',
	service: L13DiffListViewModelService,
	styles: [parseIcons(styles['l13-diff-list/l13-diff-list.css'])],
	template: templates['l13-diff-list/l13-diff-list.html'],
})
export class L13DiffListComponent extends L13Element<L13DiffListViewModel> {
	
	@L13Query('l13-diff-list-content')
	public content:HTMLElement;
	
	private context:L13DiffContextComponent;
	
	public disabled = false;
	
	public tabIndex = 0;
	
	private cacheCurrentSelections:string[] = [];
	private cacheSelectionHistory:HTMLElement[] = [];
	private cacheSelectedListItems:HTMLElement[] = [];
	private cacheListItemViews:{ [name:string]:HTMLElement } = {};
	public cacheFilteredListItemViews:HTMLElement[] = [];
	private cacheListItems:Diff[] = [];
	private cacheFilteredListItems:Diff[] = [];
	
	public constructor () {
		
		super();
		
		this.context = <L13DiffContextComponent>document.createElement('l13-diff-context');
		this.context.vmId = 'context';
		
		this.addEventListener('focus', () => {
			
			this.content.classList.add('-focus');
			msg.send('context', { name: 'l13DiffListFocus', value: true });
			
		});
		
		this.addEventListener('blur', () => {
			
			this.content.classList.remove('-focus');
			msg.send('context', { name: 'l13DiffListFocus', value: false });
			
		});
		
		this.addEventListener('keydown', (event) => {
			
			if (this.disabled) return;
			
			const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
			
			switch (key) {
				case 'F12': // Debug Mode
					if (metaKey && ctrlKey && altKey && shiftKey) changePlatform();
					break;
				case 'Enter':
					this.viewmodel.open(this.getIdsBySelection(), ctrlKey);
					break;
				case 'ArrowUp':
					this.selectPreviousOrNext(PREVIOUS, event);
					break;
				case 'ArrowDown':
					this.selectPreviousOrNext(NEXT, event);
					break;
				case 'Home':
				case 'PageUp':
					if (!isMacOs) this.selectPreviousOrNext(PREVIOUS, event);
					break;
				case 'End':
				case 'PageDown':
					if (!isMacOs) this.selectPreviousOrNext(NEXT, event);
					break;
			}
			
		});
		
		this.content.addEventListener('click', ({ target, metaKey, ctrlKey, shiftKey, offsetX }) => {
			
			if (this.disabled) return;
			
			if (this.content.firstChild && offsetX > (<HTMLElement> this.content.firstChild).offsetWidth) return;
			
			if (target === this.content) {
				this.unselect();
				return;
			}
			
			const listRow:HTMLElement = (<HTMLElement>target).closest('l13-diff-list-row');
			
			if (this.cacheSelectionHistory.length) {
		//	On macOS metaKey overrides shiftKey if both keys are pressed
				if (isMacOs && shiftKey && !metaKey || !isMacOs && shiftKey) {
					const lastSelection = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
					if (lastSelection) {
				//	On Windows selection works exactly like macOS if shiftKey and ctrlKey is pressed
				//	Otherwise Windows removes previous selection
						if (isWindows && !ctrlKey || isLinux) {
							this.unselect();
						//	On Windows previous selection will be remembered
						//	On Linux always last clicked item will be remembered
							this.cacheSelectionHistory = [isWindows ? lastSelection : listRow];
						}
						if (this.cacheSelectedListItems.length) this.cacheSelectedListItems.forEach((element) => element.classList.remove('-selected'));
						this.cacheSelectedListItems = this.selectRange(listRow, lastSelection);
					} else this.selectListItem(listRow);
				} else if (isMetaKey(ctrlKey, metaKey)) {
					listRow.classList.toggle('-selected');
					this.cacheSelectedListItems = [];
					if (!listRow.classList.contains('-selected')) remove(this.cacheSelectionHistory, listRow);
					else this.cacheSelectionHistory.push(listRow);
					if (this.content.querySelector('.-selected')) this.dispatchCustomEvent('selected');
					else this.dispatchCustomEvent('unselected');
				} else {
					this.unselect();
					this.selectListItem(listRow);
				}
			} else this.selectListItem(listRow);
			
		});
		
		this.content.addEventListener('dblclick', ({ target, altKey }) => {
			
			if (this.disabled) return;
			
			const id = (<HTMLElement>target).closest('l13-diff-list-row').getAttribute('data-id');
			
			this.viewmodel.open([id], altKey);
			
		});
		
		let dragSrcElement:HTMLElement = null;
		
		this.content.addEventListener('dragstart', (event) => {
			
			if (this.disabled) return;
			
			dragSrcElement = <HTMLElement>event.target;
			
			const columnNode = dragSrcElement.closest('l13-diff-list-file');
			const rowNode = columnNode.closest('l13-diff-list-row');
			const diff = this.viewmodel.getDiffById(rowNode.getAttribute('data-id'));
			const file = columnNode.nextElementSibling ? diff.fileA : diff.fileB;
			
			dragSrcElement.style.opacity = '0.4';
			event.dataTransfer.setData('data-diff-file', JSON.stringify(file));
			
		});
		
		let dropHoverElement:HTMLElement = null;
		
		this.content.addEventListener('dragover', (event) => {
			
			if (this.disabled) return;
			
			event.preventDefault();
			
			const element:HTMLElement = <HTMLElement>event.target;
			
			if (element) {
				const dropable:HTMLElement = element.closest('l13-diff-list-file');
				if (dropable && !dropable.classList.contains('-error') && !dropable.classList.contains('-unknown')) {
					if (dropHoverElement && dropHoverElement !== dropable) {
						dropHoverElement.classList.remove('-draghover');
					}
					if (dropable !== dropHoverElement && dropable !== dragSrcElement?.parentElement && dropable.firstElementChild) {
						dropHoverElement = dropable;
						dropHoverElement.classList.add('-draghover');
					}
				}
			}
			
		});
		
		this.content.addEventListener('dragexit', (event) => {
			
			event.preventDefault();
			
			dragSrcElement.style.opacity = '1';
			dragSrcElement = null;
			
			if (dropHoverElement) {
				dropHoverElement.classList.remove('-draghover');
				dropHoverElement = null;
			}
			
		});
		
		this.content.addEventListener('dragend', (event) => {
			
			event.preventDefault();
			
			dragSrcElement.style.opacity = '1';
			dragSrcElement = null;
			
			if (dropHoverElement) {
				dropHoverElement.classList.remove('-draghover');
				dropHoverElement = null;
			}
			
		});
		
		this.content.addEventListener('dragleave', (event) => {
			
			event.preventDefault();
			
			if (dropHoverElement) {
				dropHoverElement.classList.remove('-draghover');
				dropHoverElement = null;
			}
			
		});
		
		this.content.addEventListener('drop', (event) => {
			
			if (this.disabled) return;
			
			event.preventDefault();
			
			const target = (<HTMLElement>event.target).closest('l13-diff-list-file');
			const rowNode = target.closest('l13-diff-list-row');
			const diff = this.viewmodel.getDiffById(rowNode.getAttribute('data-id'));
			const fileA:DiffFile = <DiffFile>JSON.parse(event.dataTransfer.getData('data-diff-file'));
			const fileB:DiffFile = target.nextElementSibling ? diff.fileA : diff.fileB;
			const typeA = fileA.type;
			
			if (fileA.fsPath === fileB.fsPath || typeA !== fileB.type) return;
			
			msg.send<DiffOpenMessage>('open:diff', {
				pathA: fileA.root,
				pathB: fileB.root,
				diffs: [
					{
						id: null,
						status: 'modified',
						type: typeA,
						ignoredWhitespace: false,
						ignoredEOL: false,
						fileA,
						fileB,
					},
				],
				openToSide: event.altKey,
			});
			
		});
		
		let contextTimeoutId:NodeJS.Timeout = null;
		
		this.content.addEventListener('mouseover', ({ target }) => {
			
			if (<HTMLElement>target === this.context) return;
			
			const element:HTMLElement = (<HTMLElement>target).closest('l13-diff-list-file');
			
			if (element) {
				const context = this.context;
				const contextParentNode = context.parentNode;
				if (element.childNodes.length) {
					if (contextParentNode !== element) {
						if (contextTimeoutId) clearTimeout(contextTimeoutId);
						if (contextParentNode) context.remove();
						contextTimeoutId = setTimeout(() => {
							
							const viewmodel = context.viewmodel;
							
							switch (element.getAttribute('data-type')) {
								case 'file':
								case 'symlink':
									viewmodel.enableAll();
									break;
								case 'folder':
									viewmodel.enableAll();
									viewmodel.gotoDisabled = true;
									break;
								default:
									viewmodel.disableAll();
							}
							element.appendChild(context);
							
						}, 300);
					}
				} else {
					if (contextTimeoutId) clearTimeout(contextTimeoutId);
					if (contextParentNode) context.remove();
				}
			}
			
		});
		
		this.content.addEventListener('mouseleave', () => {
			
			if (contextTimeoutId) clearTimeout(contextTimeoutId);
			if (this.context.parentNode) this.context.remove();
			
		});
		
	//	context menu
		
		this.context.addEventListener('click', (event) => event.stopImmediatePropagation());
		this.context.addEventListener('dblclick', (event) => event.stopImmediatePropagation());
		
		this.context.addEventListener('copy', ({ target, detail }:any) => {
			
			if (this.disabled) return;
			
			const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
			const rowNode = (<HTMLElement>target).closest('l13-diff-list-row');
			const isSelected = rowNode.classList.contains('-selected');
			const selections = this.getIdsBySelection();
			const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
			
			if (!isSelected) this.cacheCurrentSelections = selections;
			
			this.dispatchCustomEvent('copy');
			
			if (detail.altKey) this.viewmodel.multiCopy(ids, fileNode.nextElementSibling ? 'left' : 'right');
			else this.viewmodel.copy(ids, fileNode.nextElementSibling ? 'left' : 'right');
			
		});
		
		this.context.addEventListener('goto', ({ target, detail }:any) => {
			
			if (this.disabled) return;
			
			const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
			const rowNode = (<HTMLElement>target).closest('l13-diff-list-row');
			const isSelected = rowNode.classList.contains('-selected');
			const selections = this.getIdsBySelection();
			const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
			
			if (!isSelected) this.cacheCurrentSelections = selections;
			
			// this.dispatchCustomEvent('goto');
			this.viewmodel.goto(ids, fileNode.nextElementSibling ? 'left' : 'right', detail.altKey);
			
		});
		
		this.context.addEventListener('reveal', ({ target }) => {
			
			if (this.disabled) return;
			
			const pathname = (<HTMLElement>target).closest('l13-diff-list-file').getAttribute('data-fs-path');
			
			msg.send<string>('reveal:file', pathname);
			
		});
		
		this.context.addEventListener('delete', ({ target }) => {
			
			if (this.disabled) return;
			
			const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
			const rowNode = (<HTMLElement>target).closest('l13-diff-list-row');
			const isSelected = rowNode.classList.contains('-selected');
			const selections = this.getIdsBySelection();
			const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
			
			if (!isSelected) this.cacheCurrentSelections = selections;
			
			this.dispatchCustomEvent('delete');
			this.viewmodel.delete(ids, isSelected ? 'files' : fileNode.nextElementSibling ? 'left' : 'right');
			
		});
		
		msg.on('cancel', () => {
			
			if (this.cacheCurrentSelections.length) this.cacheCurrentSelections = [];
			
		});
		
	}
	
	private selectListItem (element:HTMLElement) {
		
		element.classList.add('-selected');
		
		this.cacheSelectionHistory.push(element);
		this.cacheSelectedListItems = [];
		
		this.dispatchCustomEvent('selected');
		
	}
	
	private selectRange (from:HTMLElement, to:HTMLElement) {
		
		const elements:HTMLElement[] = [];
		
		[from, to] = from.offsetTop < to.offsetTop ? [from, to] : [to, from];
		
		while (from !== to) {
			from.classList.add('-selected');
			elements[elements.length] = from;
			from = <HTMLElement>from.nextElementSibling;
		}
		
		to.classList.add('-selected');
		elements[elements.length] = to;
		
		this.dispatchCustomEvent('selected');
		
		return elements;
		
	}
	
	private selectItem (element:HTMLElement, dispatchEvent = true) {
		
		element.classList.add('-selected');
		this.cacheSelectionHistory.push(element);
		scrollElementIntoView(this, element);
		
		if (dispatchEvent) this.dispatchCustomEvent('selected');
		
	}
	
	private selectNoneItem (element:HTMLElement, shiftKey:boolean) {
		
		if (!shiftKey && this.cacheSelectionHistory.length > 1) {
			this.unselect();
			element.classList.add('-selected');
			this.cacheSelectionHistory.push(element);
			this.dispatchCustomEvent('selected');
		}
		
		scrollElementIntoView(this, element);
		
	}
	
	private getFirstItem () {
		
		return <HTMLElement> this.content.firstElementChild;
		
	}
	
	private getLastItem () {
		
		return <HTMLElement> this.content.lastElementChild;
		
	}
	
	private getPreviousPageItem (currentElement:HTMLElement, viewStart:number) {
		
		let previousElementSibling:HTMLElement;
		
		while ((previousElementSibling = <HTMLElement>currentElement.previousElementSibling)) {
			if (previousElementSibling.offsetTop > viewStart) {
				currentElement = previousElementSibling;
				continue;
			}
			break;
		}
		
		return currentElement;
		
	}
	
	private getNextPageItem (currentElement:HTMLElement, viewEnd:number) {
		
		let nextElementSibling:HTMLElement;
		
		while ((nextElementSibling = <HTMLElement>currentElement.nextElementSibling)) {
			if (nextElementSibling.offsetTop + nextElementSibling.offsetHeight < viewEnd) {
				currentElement = nextElementSibling;
				continue;
			}
			break;
		}
		
		return currentElement;
		
	}
	
	private selectPreviousOrNextItem (element:HTMLElement, shiftKey:boolean) {
		
		if (!shiftKey) this.unselect();
		
		this.cacheSelectionHistory.push(element);
		element.classList.add('-selected');
		scrollElementIntoView(this, element);
		this.dispatchCustomEvent('selected');
		
	}
	
	private selectFirstOrLastItem (from:HTMLElement, to:HTMLElement, shiftKey:boolean) {
		
		if (!shiftKey) {
			this.unselect();
			to.classList.add('-selected');
			this.dispatchCustomEvent('selected');
		} else {
			if (isWindows) {
				if (this.cacheSelectedListItems.length) this.cacheSelectedListItems.forEach((element) => element.classList.remove('-selected'));
				if (this.cacheSelectionHistory.length > 1) {
					this.cacheSelectionHistory.pop();
					from = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
				}
			}
			this.cacheSelectedListItems = this.selectRange(from, to);
		}
		
		this.cacheSelectionHistory.push(to);
		scrollElementIntoView(this, to);
		
	}
	
	private selectPreviousOrNextPageItem (currentElement:HTMLElement, lastSelection:HTMLElement, shiftKey:boolean) {
		
		if (!shiftKey) {
			this.unselect();
			currentElement.classList.add('-selected');
			this.dispatchCustomEvent('selected');
		} else {
			this.cacheSelectedListItems = this.selectRange(lastSelection, currentElement);
		}
		
		this.cacheSelectionHistory.push(currentElement);
		scrollElementIntoView(this, currentElement);
		
	}
	
	private selectPreviousOrNext (direction:Direction, event:KeyboardEvent) {
		
		if (!this.content.firstChild) return;
		
		this.dispatchCustomEvent('selected');
		event.preventDefault();
		
		const lastSelection = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
		
		if (direction === NEXT) this.selectNext(event, lastSelection);
		else this.selectPrevious(event, lastSelection);
		
	}
	
	private selectPrevious ({ altKey, shiftKey, key }:KeyboardEvent, lastSelection:HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getFirstItem() : this.getLastItem());
			else if (!lastSelection.previousElementSibling) this.selectNoneItem(lastSelection, shiftKey);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getFirstItem(), shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.previousElementSibling, shiftKey);
		} else if (key === 'ArrowUp') {
			if (!lastSelection) this.selectItem(this.getLastItem());
			else if (!lastSelection.previousElementSibling) this.selectNoneItem(lastSelection, shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.previousElementSibling, shiftKey);
		} else if (key === 'PageUp') {
			const viewStart = this.scrollTop - 1; // Why does - 1 fixes the issue???
			let currentElement = this.getPreviousPageItem(this.getLastItem(), viewStart);
			if (!lastSelection) this.selectItem(currentElement, false);
			else if (currentElement === lastSelection) currentElement = this.getPreviousPageItem(lastSelection, viewStart - this.offsetHeight);
			this.selectPreviousOrNextPageItem(currentElement, lastSelection, shiftKey);
		} else if (key === 'Home') {
			if (!lastSelection) this.selectItem(this.getFirstItem());
			else this.selectFirstOrLastItem(lastSelection, this.getFirstItem(), shiftKey);
		}
		
	}
	
	private selectNext ({ altKey, shiftKey, key }:KeyboardEvent, lastSelection:HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getLastItem() : this.getFirstItem());
			else if (!lastSelection.nextElementSibling) this.selectNoneItem(lastSelection, shiftKey);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getLastItem(), shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.nextElementSibling, shiftKey);
		} else if (key === 'ArrowDown') {
			if (!lastSelection) this.selectItem(this.getFirstItem());
			else if (!lastSelection.nextElementSibling) this.selectNoneItem(lastSelection, shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.nextElementSibling, shiftKey);
		} else if (key === 'PageDown') {
			const viewHeight = this.offsetHeight;
			const viewEnd = this.scrollTop + viewHeight + 1; // Why does + 1 fixes the issue???
			let currentElement = this.getNextPageItem(this.getFirstItem(), viewEnd);
			if (!lastSelection) this.selectItem(currentElement, false);
			else if (currentElement === lastSelection) currentElement = this.getNextPageItem(lastSelection, viewEnd + viewHeight);
			this.selectPreviousOrNextPageItem(currentElement, lastSelection, shiftKey);
		} else if (key === 'End') {
			if (!lastSelection) this.selectItem(this.getLastItem());
			else this.selectFirstOrLastItem(lastSelection, this.getLastItem(), shiftKey);
		}
		
	}
	
	public selectByStatus (typeOrTypes:DiffStatus|DiffStatus[], addToSelection = false) {
		
		if (!addToSelection) this.unselect();
		
		const types = typeof typeOrTypes === 'string' ? [typeOrTypes] : typeOrTypes;
		let dispatchSelectedEvent = false;
		
		for (const type of Object.values(types)) {
			const elements = this.content.querySelectorAll(`l13-diff-list-row.-${type}`);
			if (elements.length) {
				elements.forEach((element) => element.classList.add('-selected'));
				this.cacheSelectionHistory.push(<HTMLElement>elements[elements.length - 1]);
				dispatchSelectedEvent = true;
			}
		}
		
		if (dispatchSelectedEvent) this.dispatchCustomEvent('selected');
		
	}
	
	public selectAll () {
		
		this.selectByStatus(['conflicting', 'deleted', 'modified', 'unchanged', 'untracked']);
		
	}
	
	public unselect () {
		
		this.cacheSelectionHistory = [];
		
		const elements = this.content.querySelectorAll('.-selected');
		
		if (elements.length) elements.forEach((element) => element.classList.remove('-selected'));
		
		this.dispatchCustomEvent('unselected');
		
	}
	
	private getIdsBySelection () {
		
		const elements = this.content.querySelectorAll('.-selected');
		const ids:string[] = [];
		
		elements.forEach((element) => ids.push(element.getAttribute('data-id')));
		
		return ids;
		
	}
	
	public copy (from:'left'|'right') {
		
		this.viewmodel.copy(this.getIdsBySelection(), from);
		
	}
	
	public multiCopy (from:'left'|'right') {
		
		this.viewmodel.multiCopy(this.getIdsBySelection(), from);
		
	}
	
	public delete () {
		
		this.viewmodel.delete(this.getIdsBySelection());
		
	}
	
	public update () {
		
		super.update();
		
		if (this.viewmodel.items !== this.cacheListItems) this.createListItemViews();
		if (this.viewmodel.filteredItems !== this.cacheFilteredListItems) this.createFiteredListItemViews();
		
	}
	
	private createListItemViews () {
		
		const items = this.viewmodel.items;
		const newCacheListItemViews:{ [name:string]:HTMLElement } = {};
		
		const foldersA:string[] = [];
		const foldersB:string[] = [];
		
		items.forEach(({ fileA, fileB }) => {
			
			if (fileA?.type === 'folder') foldersA.push(fileA.dirname + fileA.basename);
			if (fileB?.type === 'folder') foldersB.push(fileB.dirname + fileB.basename);
			
		});
		
		foldersA.sort().reverse();
		foldersB.sort().reverse();
		
		items.forEach((diff) => {
			
			const row = document.createElement('l13-diff-list-row');
			const fileA = diff.fileA;
			const fileB = diff.fileB;
			
			row.classList.add(`-${diff.status}`);
			row.setAttribute('data-status', diff.status);
			row.setAttribute('data-id', diff.id);
			
			appendColumn(row, diff, fileA, detectExistingFolder(fileA, foldersB, foldersA));
			appendColumn(row, diff, fileB, detectExistingFolder(fileB, foldersA, foldersB));
			
			newCacheListItemViews[diff.id] = row;
			
		});
		
		this.cacheListItems = items;
		this.cacheListItemViews = newCacheListItemViews;
		
	}
	
	private createFiteredListItemViews () {
		
		this.unselect();
		
		removeChildren(this.content);
		
		this.cacheFilteredListItemViews = [];
		
		this.viewmodel.filteredItems.forEach((diff, index) => {
			
			const element = this.cacheListItemViews[diff.id];
			
			element.setAttribute('data-index', `${index}`);
			element.style.top = `${index * 22}px`;
			this.cacheFilteredListItemViews.push(element);
			
		});
		
		this.content.style.height = `${this.cacheFilteredListItemViews.length * 22}px`;
		this.showVisibleListViewItems();
		this.restoreSelections();
		
		this.cacheFilteredListItems = this.viewmodel.filteredItems;
		
		this.dispatchCustomEvent('filtered');
		
	}
	
	public showVisibleListViewItems () {
		
		const scrollTop = this.scrollTop;
		const start = Math.floor(scrollTop / 22);
		let end = Math.ceil((scrollTop + this.offsetHeight) / 22) + 1;
		
		if (end > this.cacheFilteredListItemViews.length) {
			end = this.cacheFilteredListItemViews.length;
		}
		
		let nextElement = this.content.firstElementChild;
		const fragment = document.createDocumentFragment();
		
		removeChildren(this.content);
		
		while (nextElement) {
			const currentElement = nextElement;
			const index = parseInt(currentElement.getAttribute('data-index'), 10);
			if (index < start || index > end) currentElement.remove();
			nextElement = nextElement.nextElementSibling || this.content.firstElementChild;
		}
		
		for (let i = start; i < end; i++) {
			const element = this.cacheFilteredListItemViews[i];
			if (!element.parentNode) fragment.appendChild(element);
		}
		
		this.content.appendChild(fragment);
		
		console.log(this.content.childNodes.length);
		
	}
	
	private restoreSelections () {
		
		const cacheCurrentSelections = this.cacheCurrentSelections;
		
		if (cacheCurrentSelections.length) {
			cacheCurrentSelections.forEach((id) => {
				
				const element = this.cacheListItemViews[id];
				
				if (element.parentNode) element.classList.add('-selected');
				
			});
			this.cacheCurrentSelections = [];
			this.dispatchCustomEvent('selected');
		}
		
	}
	
}

//	Functions __________________________________________________________________

function appendColumn (parent:HTMLElement, diff:Diff, file:DiffFile, exists:string[]) {
	
	const column = document.createElement('l13-diff-list-file');
	
	if (file) {
		const type = file.type;
		const fsPath = file.fsPath;
		
		column.classList.add(`-${type}`);
		column.setAttribute('data-type', type);
		column.setAttribute('data-fs-path', fsPath);
		column.title = fsPath;
		
		if (file.stat) {
			const stat = file.stat;
			column.title += `
Size: ${formatFileSize(stat.size)}
Created: ${formatDate(new Date(stat.birthtime))}
Modified: ${formatDate(new Date(stat.mtime))}`;
		}
		
		if (file.ignore) {
			if (!diff.fileA) column.classList.add('-untracked');
			if (!diff.fileB) column.classList.add('-deleted');
		}
		
		const path = document.createElement('DIV');
		path.classList.add('-path');
		path.draggable = type === 'file' || type === 'folder' || type === 'symlink';
		column.appendChild(path);
		
		if (file.dirname) {
			const dirname = document.createDocumentFragment();
			
			if (exists[0]) {
				const dirnameExists = document.createElement('SPAN');
				dirnameExists.classList.add('-exists');
				dirnameExists.textContent = exists[0];
				dirname.appendChild(dirnameExists);
			}
			
			if (exists[1]) {
				const dirnameMissing = document.createElement('SPAN');
				dirnameMissing.classList.add('-missing');
				dirnameMissing.textContent = exists[1];
				dirname.appendChild(dirnameMissing);
			}
			
			path.appendChild(dirname);
		}
		
		const basename = document.createElement('SPAN');
		basename.textContent = file.basename;
		basename.classList.add('-basename');
		path.appendChild(basename);
		
		if (diff.status === 'unchanged' && (diff.ignoredEOL || diff.ignoredWhitespace)) {
			const ignored = document.createElement('SPAN');
			const values = [];
			if (diff.ignoredEOL) values.push('eol');
			if (diff.ignoredWhitespace) values.push('whitespace');
			ignored.textContent = `(ignored ${values.join(' and ')})`;
			ignored.classList.add('-info');
			path.appendChild(ignored);
		}
	}
	
	parent.appendChild(column);
	
}

function detectExistingFolder (file:DiffFile, otherFolders:string[], sameFolders:string[]) {
	
	if (!file) return null;
	
	const dirname = file.dirname;
	
	for (const folder of otherFolders) {
		if (dirname.startsWith(folder) && sameFolders.includes(folder)) {
			return [folder, dirname.replace(folder, '')];
		}
	}
	
	return [null, file.dirname];
	
}