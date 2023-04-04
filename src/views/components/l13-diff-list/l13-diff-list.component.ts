//	Imports ____________________________________________________________________

import type { Dictionary, Diff, DiffFile, DiffStatus } from '../../../types';

import { remove } from '../../../@l13/arrays';
import { formatDate, formatFileSize, formatList } from '../../../@l13/formats';

import { MODIFIED } from '../../../services/@l13/buffers';

import { changePlatform, isLinux, isMacOs, isWindows, L13Component, L13Element, L13Query } from '../../@l13/core';

import { disableContextMenu, isMetaKey, msg, parseIcons, removeChildren, scrollElementIntoView } from '../../common';
import { enablePreview } from '../../settings';

import type { L13DiffContextComponent } from '../l13-diff-context/l13-diff-context.component';

import styles from '../styles';
import templates from '../templates';

import * as context from './events/context-menu';
import * as dragNDrop from './events/drag-n-drop';

import { L13DiffListViewModelService } from './l13-diff-list.service';
import type { L13DiffListViewModel } from './l13-diff-list.viewmodel';

//	Variables __________________________________________________________________

const enum DIRECTION {
	PREVIOUS,
	NEXT,
}

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
	public content: HTMLElement;
	
	private context: L13DiffContextComponent;
	
	public disabled = false;
	
	public tabIndex = 0;
	
	public readonly rowHeight = 22;
	
	private previousScrollTop = 0;
	
	public currentSelections: string[] = [];
	
	private cacheSelectionHistory: HTMLElement[] = [];
	
	private cacheSelectedListItems: HTMLElement[] = [];
	
	private cacheListItems: Diff[] = [];
	
	private cacheListItemViews: Dictionary<HTMLElement> = {};
	
	private cacheFilteredListItems: Diff[] = [];
	
	public filteredListItemViews: HTMLElement[] = [];
	
	public dragSrcRowElement: HTMLElement = null;
	
	private hasPanelFocus = true;
	
	public constructor () {
		
		super();
		
		// this.detectRowHeight();
		
	//	context menu
	
		this.context = <L13DiffContextComponent>document.createElement('l13-diff-context');
		this.context.vmId = 'context';
		
		context.init({ context: this.context, list: this });
		dragNDrop.init({ list: this });
		
		disableContextMenu(this);
		
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
				case ' ':
					if (enablePreview) {
						const lastSelection = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
						if (lastSelection) {
							const id = lastSelection.getAttribute('data-id');
							const type = this.viewmodel.getDiffById(id).type;
							if (type === 'file' || type === 'symlink') {
								this.viewmodel.openPreview(id);
							}
							if (this.cacheSelectionHistory.length > 1) {
								const ids = this.getIdsBySelection().filter((value) => value !== id);
								if (ids.length) this.viewmodel.open(ids, true);
							}
						}
					}
					event.preventDefault();
					break;
				case 'Enter':
					this.viewmodel.open(this.getIdsBySelection(), ctrlKey);
					event.preventDefault();
					break;
				case 'ArrowUp':
					this.selectPreviousOrNext(DIRECTION.PREVIOUS, event);
					break;
				case 'ArrowDown':
					this.selectPreviousOrNext(DIRECTION.NEXT, event);
					break;
				case 'Home':
				case 'PageUp':
					if (!isMacOs) this.selectPreviousOrNext(DIRECTION.PREVIOUS, event);
					break;
				case 'End':
				case 'PageDown':
					if (!isMacOs) this.selectPreviousOrNext(DIRECTION.NEXT, event);
					break;
			}
			
		});
		
		this.addEventListener('wheel', (event) => {
			
			event.stopImmediatePropagation();
			event.preventDefault();
			
			this.scrollTop += event.deltaY;
			
		});
		
		this.content.addEventListener('click', async ({ detail, target, metaKey, ctrlKey, shiftKey, offsetX }) => {
			
			if (this.disabled || detail !== 1) return;
			
			if (this.content.firstChild && offsetX > (<HTMLElement> this.content.firstChild).offsetWidth) return;
			
			if (target === this.content) {
				this.unselect();
				return;
			}
			
			
			const listRow: HTMLElement = (<HTMLElement>target).closest('l13-diff-list-row');
			
			if (enablePreview) {
				const id = listRow.getAttribute('data-id');
				const type = this.viewmodel.getDiffById(id).type;
				if (type === 'file' || type === 'symlink') {
					await this.waitForPanelFocus();
					this.viewmodel.openPreview(id);
				}
			}
			
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
						if (this.cacheSelectedListItems.length) this.unselectItems(this.cacheSelectedListItems);
						this.cacheSelectedListItems = this.selectRange(listRow, lastSelection);
					} else this.selectListItem(listRow);
				} else if (isMetaKey(ctrlKey, metaKey)) {
					this.toggleItemSelection(listRow);
					this.cacheSelectedListItems = [];
					if (!this.isSelectedItem(listRow)) remove(this.cacheSelectionHistory, listRow);
					else this.cacheSelectionHistory.push(listRow);
					if (this.hasSelectedItem()) this.dispatchEventSelected();
					else this.dispatchEventUnselected();
				} else {
					this.unselect();
					this.selectListItem(listRow);
				}
			} else this.selectListItem(listRow);
			
		});
		
		this.content.addEventListener('dblclick', async ({ target, altKey }) => {
			
			if (this.disabled) return;
			
			const id = (<HTMLElement>target).closest('l13-diff-list-row').getAttribute('data-id');
			const type = this.viewmodel.getDiffById(id).type;
			
			await this.waitForPanelFocus();
			
			this.viewmodel.open([id], type === 'folder' ? altKey : altKey || enablePreview);
			
		});
		
		msg.on('focus', (value: boolean) => {
			
			this.hasPanelFocus = value;
			
		});
		
		msg.on('cancel', () => {
			
			if (this.currentSelections.length) this.currentSelections = [];
			
		});
		
	}
	
	async waitForPanelFocus () { // Fixes the issue if panel has no focus for vscode.ViewColumn.Beside
		
		if (this.hasPanelFocus) return Promise.resolve(true);
	
		return new Promise((resolve) => {
		
			function focus (value: boolean) {
				
				if (value) {
					clearTimeout(timeoutId);
					msg.removeMessageListener('focus', focus);
					resolve(true);
				}
				
			}
			
			const timeoutId = setTimeout(() => focus(true), 500);
			
			msg.on('focus', focus);
			
		});
		
	}
	
	// private detectRowHeight () {
		
	// 	const row = document.createElement('l13-diff-list-row');
		
	// 	row.appendChild(document.createTextNode('\u00A0'));
	// 	this.content.appendChild(row);
	// 	this.rowHeight = (<HTMLElement> this.content.firstElementChild).offsetHeight;
	// 	row.remove();
		
	// }
	
	private selectListItem (element: HTMLElement) {
		
		this.addItemSelection(element);
		this.cacheSelectionHistory.push(element);
		this.cacheSelectedListItems = [];
		this.dispatchEventSelected();
		
	}
	
	private selectRange (from: HTMLElement, to: HTMLElement) {
		
		const fromIndex = this.getIndex(from);
		const toIndex = this.getIndex(to);
		
		const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
		const elements = this.filteredListItemViews.slice(start, end + 1);
		
		this.selectItems(elements);
		this.dispatchEventSelected();
		
		return elements;
		
	}
	
	private selectItem (element: HTMLElement, dispatchEvent = true) {
		
		this.addItemSelection(element);
		this.cacheSelectionHistory.push(element);
		scrollElementIntoListView(this, element);
		
		if (dispatchEvent) this.dispatchEventSelected();
		
	}
	
	private selectNoneItem (element: HTMLElement, shiftKey: boolean) {
		
		if (!shiftKey && this.cacheSelectionHistory.length > 1) {
			this.unselect();
			this.addItemSelection(element);
			this.cacheSelectionHistory.push(element);
			this.dispatchEventSelected();
		}
		
		scrollElementIntoListView(this, element);
		
	}
	
	private addIndex (element: HTMLElement, index: number) {
		
		element.setAttribute('data-index', `${index}`);
		
	}
	
	private getIndex (element: HTMLElement) {
		
		return +element.getAttribute('data-index');
		
	}
	
	private getFirstItem () {
		
		return this.filteredListItemViews[0];
		
	}
	
	private getLastItem () {
		
		return this.filteredListItemViews[this.filteredListItemViews.length - 1];
		
	}
	
	private getNextItem (element: HTMLElement) {
		
		return this.filteredListItemViews[this.getIndex(element) + 1];
		
	}
	
	private getPreviousItem (element: HTMLElement) {
		
		return this.filteredListItemViews[this.getIndex(element) - 1];
		
	}
	
	public isSelectedItem (element: HTMLElement) {
		
		return element.classList.contains('-selected');
		
	}
	
	public hasSelectedItem () {
		
		return this.filteredListItemViews.some((element) => element.classList.contains('-selected'));
		
	}
	
	public getSelectedItems () {
		
		return this.filteredListItemViews.filter((element) => element.classList.contains('-selected'));
		
	}
	
	private addItemSelection (element: HTMLElement) {
		
		element.classList.add('-selected');
		
	}
	
	private removeItemSelection (element: HTMLElement) {
		
		element.classList.remove('-selected');
		
	}
	
	private toggleItemSelection (element: HTMLElement) {
		
		element.classList.toggle('-selected');
		
	}
	
	private selectItems (elements: HTMLElement[]) {
		
		elements.forEach((element) => element.classList.add('-selected'));
		
	}
	
	private unselectItems (elements: HTMLElement[]) {
		
		elements.forEach((element) => element.classList.remove('-selected'));
		
	}
	
	private dispatchEventSelected () {
		
		this.dispatchCustomEvent('selected');
		
	}
	
	private dispatchEventUnselected () {
		
		this.dispatchCustomEvent('unselected');
		
	}
	
	private getPreviousPageItem (currentElement: HTMLElement, viewStart: number) {
		
		let previousElementSibling: HTMLElement;
		
		while ((previousElementSibling = this.getPreviousItem(currentElement))) {
			if (parseInt(previousElementSibling.style.top, 10) > viewStart) {
				currentElement = previousElementSibling;
				continue;
			}
			break;
		}
		
		return currentElement;
		
	}
	
	private getNextPageItem (currentElement: HTMLElement, viewEnd: number) {
		
		let nextElementSibling: HTMLElement;
		
		while ((nextElementSibling = this.getNextItem(currentElement))) {
			if (parseInt(nextElementSibling.style.top, 10) + this.rowHeight < viewEnd) {
				currentElement = nextElementSibling;
				continue;
			}
			break;
		}
		
		return currentElement;
		
	}
	
	private selectPreviousOrNextItem (element: HTMLElement, shiftKey: boolean) {
		
		if (!shiftKey) this.unselect();
		
		this.cacheSelectionHistory.push(element);
		this.addItemSelection(element);
		scrollElementIntoListView(this, element);
		
		this.dispatchEventSelected();
		
	}
	
	private selectFirstOrLastItem (from: HTMLElement, to: HTMLElement, shiftKey: boolean) {
		
		if (!shiftKey) {
			this.unselect();
			this.addItemSelection(to);
			this.dispatchEventSelected();
		} else {
			if (isWindows) {
				if (this.cacheSelectedListItems.length) this.unselectItems(this.cacheSelectedListItems);
				if (this.cacheSelectionHistory.length > 1) {
					this.cacheSelectionHistory.pop();
					from = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
				}
			}
			this.cacheSelectedListItems = this.selectRange(from, to);
		}
		
		this.cacheSelectionHistory.push(to);
		scrollElementIntoListView(this, to);
		
	}
	
	private selectPreviousOrNextPageItem (currentElement: HTMLElement, lastSelection: HTMLElement, shiftKey: boolean) {
		
		if (!shiftKey) {
			this.unselect();
			this.addItemSelection(currentElement);
			this.dispatchEventSelected();
		} else {
			this.cacheSelectedListItems = this.selectRange(lastSelection, currentElement);
		}
		
		this.cacheSelectionHistory.push(currentElement);
		scrollElementIntoListView(this, currentElement);
		
	}
	
	private selectPreviousOrNext (direction: DIRECTION, event: KeyboardEvent) {
		
		if (!this.content.firstChild) return;
		
		this.dispatchEventSelected();
		event.preventDefault();
		
		const lastSelection = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
		
		if (direction === DIRECTION.NEXT) this.selectNext(event, lastSelection);
		else this.selectPrevious(event, lastSelection);
		
	}
	
	private selectPrevious ({ altKey, shiftKey, key }: KeyboardEvent, lastSelection: HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getFirstItem() : this.getLastItem());
			else if (!this.getPreviousItem(lastSelection)) this.selectNoneItem(lastSelection, shiftKey);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getFirstItem(), shiftKey);
			else this.selectPreviousOrNextItem(this.getPreviousItem(lastSelection), shiftKey);
		} else if (key === 'ArrowUp') {
			if (!lastSelection) this.selectItem(this.getLastItem());
			else if (!this.getPreviousItem(lastSelection)) this.selectNoneItem(lastSelection, shiftKey);
			else this.selectPreviousOrNextItem(this.getPreviousItem(lastSelection), shiftKey);
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
	
	private selectNext ({ altKey, shiftKey, key }: KeyboardEvent, lastSelection: HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getLastItem() : this.getFirstItem());
			else if (!this.getNextItem(lastSelection)) this.selectNoneItem(lastSelection, shiftKey);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getLastItem(), shiftKey);
			else this.selectPreviousOrNextItem(this.getNextItem(lastSelection), shiftKey);
		} else if (key === 'ArrowDown') {
			if (!lastSelection) this.selectItem(this.getFirstItem());
			else if (!this.getNextItem(lastSelection)) this.selectNoneItem(lastSelection, shiftKey);
			else this.selectPreviousOrNextItem(this.getNextItem(lastSelection), shiftKey);
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
	
	public selectByStatus (typeOrTypes: DiffStatus | DiffStatus[], addToSelection = false) {
		
		if (!addToSelection) this.unselect();
		
		const types = typeof typeOrTypes === 'string' ? [typeOrTypes] : typeOrTypes;
		let dispatchSelectedEvent = false;
		
		for (const type of Object.values(types)) {
			const elements = this.filteredListItemViews.filter((element) => element.classList.contains(`-${type}`));
			if (elements.length) {
				this.selectItems(elements);
				this.cacheSelectionHistory.push(elements[elements.length - 1]);
				dispatchSelectedEvent = true;
			}
		}
		
		if (dispatchSelectedEvent) this.dispatchEventSelected();
		
	}
	
	public selectAll () {
		
		this.selectByStatus(['conflicting', 'deleted', 'modified', 'unchanged', 'untracked']);
		
	}
	
	public unselect () {
		
		this.cacheSelectionHistory = [];
		this.unselectItems(this.filteredListItemViews);
		this.dispatchEventUnselected();
		
	}
	
	public getIdsBySelection () {
		
		return this.getSelectedItems().map((element) => element.getAttribute('data-id'));
		
	}
	
	public copy (from: 'left' | 'right') {
		
		this.viewmodel.copy(this.getIdsBySelection(), from);
		
	}
	
	public multiCopy (from: 'left' | 'right') {
		
		this.viewmodel.multiCopy(this.getIdsBySelection(), from);
		
	}
	
	public delete () {
		
		this.viewmodel.delete(this.getIdsBySelection());
		
	}
	
	public update (options?: { keepPosition: boolean }) {
		
		super.update();
		
		if (this.viewmodel.items !== this.cacheListItems) this.createListItemViews();
		if (this.viewmodel.filteredItems !== this.cacheFilteredListItems) this.createFilteredListItemViews(options);
		
	}
	
	private createListItemViews () {
		
		const items = this.viewmodel.items;
		const cacheListItemViews: Dictionary<HTMLElement> = {};
		
		const foldersA: string[] = [];
		const foldersB: string[] = [];
		
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
			
			cacheListItemViews[diff.id] = row;
			
		});
		
		this.cacheListItems = items;
		this.cacheListItemViews = cacheListItemViews;
		
	}
	
	private createFilteredListItemViews (options?: { keepPosition: boolean }) {
		
		this.unselect();
		
		removeChildren(this.content);
		
		this.filteredListItemViews = [];
		
		this.viewmodel.filteredItems.forEach((diff, index) => {
			
			const element = this.cacheListItemViews[diff.id];
			
			this.addIndex(element, index);
			element.style.top = `${index * this.rowHeight}px`;
			this.filteredListItemViews.push(element);
			
		});
		
		this.content.style.height = `${this.filteredListItemViews.length * this.rowHeight}px`;
		
		if (!options?.keepPosition) {
			this.scrollTop = 0;
			this.previousScrollTop = 0;
		}
		
		this.showVisibleListViewItems(true);
		this.restoreSelections();
		
		this.cacheFilteredListItems = this.viewmodel.filteredItems;
		
		this.dispatchCustomEvent('filtered');
		
	}
	
	public showVisibleListViewItems (forceUpdate?: boolean) {
		
		const scrollTop = this.scrollTop;
		const delta = scrollTop - this.previousScrollTop;
		const rowHeight = this.rowHeight;
		
		if (!forceUpdate && delta > -rowHeight && delta < rowHeight) return;
		
		this.previousScrollTop = scrollTop;
		
		const elements = this.filteredListItemViews;
		const dragSrcRowElement = this.dragSrcRowElement;
		let nextElement = <HTMLElement> this.content.firstElementChild;
		
		let start = Math.floor(scrollTop / rowHeight) - 1;
		let end = Math.ceil((scrollTop + this.offsetHeight) / rowHeight) + 1;
		
		if (start < 0) start = 0;
		if (end > elements.length) end = elements.length;
		
		while (nextElement) {
			const element = nextElement;
			const index = this.getIndex(element);
			nextElement = <HTMLElement>element.nextElementSibling;
			if (element !== dragSrcRowElement && (index < start || index > end)) element.remove();
		}
		
		const fragment = document.createDocumentFragment();
		
		for (let i = start; i < end; i++) {
			const element = elements[i];
			if (!element.parentNode) fragment.appendChild(element);
		}
		
		this.content.appendChild(fragment);
		
	}
	
	private restoreSelections () {
		
		const cacheCurrentSelections = this.currentSelections;
		
		if (cacheCurrentSelections.length) {
			cacheCurrentSelections.forEach((id) => {
				
				const element = this.cacheListItemViews[id];
				
				if (element.parentNode) this.addItemSelection(element);
				
			});
			this.currentSelections = [];
			this.dispatchEventSelected();
		}
		
	}
	
}

//	Functions __________________________________________________________________

function appendColumn (parent: HTMLElement, diff: Diff, file: DiffFile, exists: string[]) {
	
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
		
		if (diff.status === 'unchanged' && (diff.ignoredBOM || diff.ignoredEOL || diff.ignoredWhitespace)) {
			const ignored = document.createElement('SPAN');
			const modified = diff.fileA === file ? MODIFIED.LEFT : MODIFIED.RIGHT;
			const values = [];
			if (diff.ignoredBOM === MODIFIED.BOTH || diff.ignoredBOM === modified) values.push('BOM');
			if (diff.ignoredEOL === MODIFIED.BOTH || diff.ignoredEOL === modified) values.push('EOL');
			if (diff.ignoredWhitespace === MODIFIED.BOTH || diff.ignoredWhitespace === modified) values.push('Whitespace');
			if (values.length) {
				ignored.textContent = `(ignored ${formatList(values)})`;
				ignored.classList.add('-info');
				path.appendChild(ignored);
			}
		}
	}
	
	parent.appendChild(column);
	
}

function detectExistingFolder (file: DiffFile, otherFolders: string[], sameFolders: string[]) {
	
	if (!file) return null;
	
	const dirname = file.dirname;
	
	for (const folder of otherFolders) {
		if (dirname.startsWith(folder) && sameFolders.includes(folder)) {
			return [folder, dirname.replace(folder, '')];
		}
	}
	
	return [null, file.dirname];
	
}

function scrollElementIntoListView (list: L13DiffListComponent, element: HTMLElement) {
	
//	Fixes virtual scrolling if element is not in the DOM
	if (!element.parentNode) list.content.appendChild(element);
	
	scrollElementIntoView(list, element);
	
}