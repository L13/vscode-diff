//	Imports ____________________________________________________________________

import { remove } from '../../../@l13/natvies/arrays';
import { Diff, File } from '../../../types';
import { addKeyListener, changePlatform, isLinux, isMacOs, isWindows, L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffContextComponent } from '../l13-diff-context/l13-diff-context.component';
import { L13DiffListViewModelService } from './l13-diff-list.service';
import { L13DiffListViewModel } from './l13-diff-list.viewmodel';

import { isMetaKey, msg, parseIcons, removeChildren, scrollElementIntoView } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

enum Direction { PREVIOUS, NEXT }
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
	
	public disabled:boolean = false;
	
	public tabIndex = 0;
	
	private cacheCurrentSelections:string[] = [];
	private cacheSelectionHistory:HTMLElement[] = [];
	private cacheSelectedListItems:HTMLElement[] = [];
	private cacheListItemViews:{ [name:string]:HTMLElement } = {};
	private cacheListItems:Diff[] = [];
	private cacheFilteredListItems:Diff[] = [];
	
	public constructor () {
		
		super();
		
		this.context = <L13DiffContextComponent>document.createElement('l13-diff-context');
		
		const focusListView = () => this.focus();
		
		window.addEventListener('focus', () => {
			
			if (this.cacheSelectionHistory.length) setTimeout(focusListView, 0);
			
		});
		
		this.addEventListener('focus', () => this.content.classList.add('-focus'));
		this.addEventListener('blur', () => this.content.classList.remove('-focus'));
		
		addKeyListener(this, { key: 'Ctrl+A', mac: 'Cmd+A' }, () => this.selectAll());
		
		this.addEventListener('keydown', (event) => {
			
			if (this.disabled) return;
			
			const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
			
			switch (key) {
				case 'F12': // Debug Mode
					if (metaKey && ctrlKey && altKey && shiftKey) changePlatform();
					break;
				case 'Escape':
					this.unselect();
					break;
				case 'Enter':
					this.getIdsBySelection().forEach((id) => {
						
						msg.send(ctrlKey ? 'open:diffToSide' : 'open:diff', { diff: this.viewmodel.getDiffById(id) });
						
					});
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
			
			if (this.content.firstChild && offsetX > (<HTMLElement>this.content.firstChild).offsetWidth) return;
			
			if (target === this.content) {
				this.unselect();
				return;
			}
			
			const listRow = <HTMLElement>(<HTMLElement>target).closest('l13-diff-list-row');
			
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
			
			const id = (<HTMLElement>(<HTMLElement>target).closest('l13-diff-list-row')).getAttribute('data-id');
			
			msg.send(altKey ? 'open:diffToSide' : 'open:diff', { diff: this.viewmodel.getDiffById(id) });
			
		});
		
		this.content.addEventListener('mouseover', ({ target }) => {
			
			if (<HTMLElement>target === this.context) return;
			
			let element:HTMLElement = null;
			
			if ((<HTMLElement>target).nodeName === 'L13-DIFF-LIST-FILE') element = (<HTMLElement>target);
			else if ((<HTMLElement>target).parentNode.nodeName === 'L13-DIFF-LIST-FILE') element = (<HTMLElement>(<HTMLElement>target).parentNode);
			
			if (element) {
				if (element.childNodes.length) {
					if (this.context.parentNode !== element) element.appendChild(this.context);
				} else this.context.remove();
			}
			
		});
		
		this.content.addEventListener('mouseleave', () => this.context.remove());
		
	//	context menu
		
		this.context.addEventListener('click', (event) => event.stopImmediatePropagation());
		this.context.addEventListener('dblclick', (event) => event.stopImmediatePropagation());
		
		this.context.addEventListener('copy', ({ target, detail }:any) => {
			
			if (this.disabled) return;
			
			const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
			const rowNode = (<HTMLElement>(<HTMLElement>target).closest('l13-diff-list-row'));
			const isSelected = rowNode.classList.contains('-selected');
			const selections = this.getIdsBySelection();
			const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
			
			if (!isSelected) this.cacheCurrentSelections = selections;
			
			this.dispatchCustomEvent('copy');
			
			if (detail.altKey) this.viewmodel.multiCopy(fileNode.nextElementSibling ? 'left' : 'right', ids);
			else this.viewmodel.copy(fileNode.nextElementSibling ? 'left' : 'right', ids);
			
		});
		
		this.context.addEventListener('delete', ({ target }) => {
			
			if (this.disabled) return;
			
			const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
			const rowNode = (<HTMLElement>(<HTMLElement>target).closest('l13-diff-list-row'));
			const isSelected = rowNode.classList.contains('-selected');
			const selections = this.getIdsBySelection();
			const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
			
			if (!isSelected) this.cacheCurrentSelections = selections;
			
			this.dispatchCustomEvent('delete');
			this.viewmodel.delete(ids, isSelected ? 'files' : fileNode.nextElementSibling ? 'left' : 'right');
			
		});
		
		this.context.addEventListener('reveal', ({ target }) => {
			
			if (this.disabled) return;
			
			const pathname = (<HTMLElement>(<HTMLElement>target).closest('l13-diff-list-file')).getAttribute('data-file');
			
			msg.send('reveal:file', { pathname });
			
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
	
	private selectItem (element:HTMLElement, dispatchEvent:boolean = true) {
		
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
		
		return <HTMLElement>this.content.firstElementChild;
		
	}
	
	private getLastItem () {
		
		return <HTMLElement>this.content.lastElementChild;
		
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
		} else {
			if (key === 'ArrowUp') {
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
		
	}
	
	private selectNext ({ altKey, shiftKey, key }:KeyboardEvent, lastSelection:HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getLastItem() : this.getFirstItem());
			else if (!lastSelection.nextElementSibling) this.selectNoneItem(lastSelection, shiftKey);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getLastItem(), shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.nextElementSibling, shiftKey);
		} else {
			if (key === 'ArrowDown') {
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
		
	}
	
	public selectByStatus (type:string, addToSelection:boolean = false) {
		
		if (!addToSelection) this.unselect();
		
		const elements = this.content.querySelectorAll(`l13-diff-list-row.-${type}`);
		
		if (elements.length) {
			elements.forEach((element) => element.classList.add('-selected'));
			this.cacheSelectionHistory.push(<HTMLElement>elements[elements.length - 1]);
			this.dispatchCustomEvent('selected');
		}
		
	}
	
	public selectAll () {
		
		const elements = this.content.querySelectorAll(`l13-diff-list-row`);
		
		if (elements.length) {
			elements.forEach((element) => element.classList.add('-selected'));
			this.cacheSelectionHistory.push(<HTMLElement>elements[elements.length - 1]);
			this.dispatchCustomEvent('selected');
		}
		
	}
	
	public unselect () {
		
		this.cacheSelectionHistory = [];
		
		const elements = this.content.querySelectorAll('.-selected');
		
		if (elements.length) elements.forEach((element) => element.classList.remove('-selected'));
		
		this.dispatchCustomEvent('unselected');
		
	}
	
	private getIdsBySelection () :string[] {
		
		const elements = this.content.querySelectorAll('.-selected');
		const ids:string[] = [];
		
		elements.forEach((element) => ids.push(element.getAttribute('data-id')));
		
		return ids;
		
	}
	
	public copy (from:'left'|'right') :void {
		
		this.viewmodel.copy(from, this.getIdsBySelection());
		
	}
	
	public multiCopy (from:'left'|'right') :void {
		
		this.viewmodel.multiCopy(from, this.getIdsBySelection());
		
	}
	
	public delete () :void {
		
		this.viewmodel.delete(this.getIdsBySelection());
		
	}
	
	public update () {
		
		super.update();
		
		if (this.viewmodel.items !== this.cacheListItems) this.createListItemViews();
		if (this.viewmodel.filteredItems !== this.cacheFilteredListItems) this.showFiteredListItemViews();
		
	}
	
	private createListItemViews () :void {
		
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
			
			row.classList.add('-' + diff.status);
			row.setAttribute('data-status', diff.status);
			row.setAttribute('data-id', '' + diff.id);
			
			appendColumn(row, diff, fileA, detectExistingFolder(fileA, foldersB, foldersA));
			appendColumn(row, diff, fileB, detectExistingFolder(fileB, foldersA, foldersB));
			
			newCacheListItemViews[diff.id] = row;
			
		});
		
		this.cacheListItems = items;
		this.cacheListItemViews = newCacheListItemViews;
		
	}
	
	private showFiteredListItemViews () {
		
		this.unselect();
		
		removeChildren(this.content);
		
		const fragment = document.createDocumentFragment();
		
		this.viewmodel.filteredItems.forEach((diff) => {
			
			fragment.appendChild(this.cacheListItemViews[diff.id]);
			
		});
		
		this.content.appendChild(fragment);
		this.restoreSelections();
		
		this.cacheFilteredListItems = this.viewmodel.filteredItems;
		
		this.dispatchCustomEvent('filtered');
		
	}
	
	private restoreSelections () :void {
		
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

function appendColumn (parent:HTMLElement, diff:Diff, file:File, exists:string[]) {
	
	const column = document.createElement('l13-diff-list-file');
	
	if (file) {
		column.classList.add(`-${file.type}`);
		column.setAttribute('data-file', file.path);
		
		if (file.dirname) {
			const dirname = document.createDocumentFragment();
			
			if (exists[0]) {
				const dirnameExists = document.createElement('SPAN');
				dirnameExists.classList.add(`-exists`);
				dirnameExists.textContent = exists[0];
				dirname.appendChild(dirnameExists);
			}
			
			if (exists[1]) {
				const dirnameMissing = document.createElement('SPAN');
				dirnameMissing.classList.add(`-missing`);
				dirnameMissing.textContent = exists[1];
				dirname.appendChild(dirnameMissing);
			}
			
			column.appendChild(dirname);
		}
		
		const basename = document.createElement('SPAN');
		basename.textContent = file.basename;
		basename.classList.add(`-basename`);
		column.appendChild(basename);
		
		if (diff.status === 'unchanged' && (diff.ignoredEOL || diff.ignoredWhitespace)) {
			const ignored = document.createElement('SPAN');
			const values = [];
			if (diff.ignoredEOL) values.push('eol');
			if (diff.ignoredWhitespace) values.push('whitespace');
			ignored.textContent = `(ignored ${values.join(' and ')})`;
			ignored.classList.add('-ignored');
			column.appendChild(ignored);
		}
	}
	
	parent.appendChild(column);
	
}

function detectExistingFolder (file:File, otherFolders:string[], sameFolders:string[]) {
	
	if (!file) return null;
	
	const dirname = file.dirname;
	
	for (const folder of otherFolders) {
		if (dirname.startsWith(folder) && sameFolders.includes(folder)) {
			return [folder, dirname.replace(folder, '')];
		}
	}
	
	return [null, file.dirname];
	
}