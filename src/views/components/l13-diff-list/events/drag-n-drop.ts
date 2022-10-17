//	Imports ____________________________________________________________________

import type { DiffFile, DiffOpenMessage, DragNDropEventsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ list }: DragNDropEventsInit) {
	
	let dragSrcElement: HTMLElement = null;
	let dropHoverElement: HTMLElement = null;
	
	list.content.addEventListener('dragstart', (event) => {
		
		if (list.disabled) return;
		
		dragSrcElement = <HTMLElement>event.target;
		list.dragSrcRowElement = dragSrcElement.closest('l13-diff-list-row');
		
		const columnNode = dragSrcElement.closest('l13-diff-list-file');
		const rowNode = columnNode.closest('l13-diff-list-row');
		const diff = list.viewmodel.getDiffById(rowNode.getAttribute('data-id'));
		const file = columnNode.nextElementSibling ? diff.fileA : diff.fileB;
		
		dragSrcElement.style.opacity = '0.4';
		event.dataTransfer.setData('data-diff-file', JSON.stringify(file));
		
	});
	
	list.content.addEventListener('dragover', (event) => {
		
		if (list.disabled) return;
		
		event.preventDefault();
		
		const element: HTMLElement = <HTMLElement>event.target;
		
		if (element) {
			const dropable: HTMLElement = element.closest('l13-diff-list-file');
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
	
	list.content.addEventListener('dragexit', (event) => {
		
		event.preventDefault();
		
		dragSrcElement.style.opacity = '1';
		list.dragSrcRowElement = null;
		dragSrcElement = null;
		
		if (dropHoverElement) {
			dropHoverElement.classList.remove('-draghover');
			dropHoverElement = null;
		}
		
	});
	
	list.content.addEventListener('dragend', (event) => {
		
		event.preventDefault();
		
		dragSrcElement.style.opacity = '1';
		list.dragSrcRowElement = null;
		dragSrcElement = null;
		
		if (dropHoverElement) {
			dropHoverElement.classList.remove('-draghover');
			dropHoverElement = null;
		}
		
	});
	
	list.content.addEventListener('dragleave', (event) => {
		
		event.preventDefault();
		
		if (dropHoverElement) {
			dropHoverElement.classList.remove('-draghover');
			dropHoverElement = null;
		}
		
	});
	
	list.content.addEventListener('drop', (event) => {
		
		if (list.disabled) return;
		
		event.preventDefault();
		
		const target = (<HTMLElement>event.target).closest('l13-diff-list-file');
		const rowNode = target.closest('l13-diff-list-row');
		const diff = list.viewmodel.getDiffById(rowNode.getAttribute('data-id'));
		const fileA: DiffFile = <DiffFile>JSON.parse(event.dataTransfer.getData('data-diff-file'));
		const fileB: DiffFile = target.nextElementSibling ? diff.fileA : diff.fileB;
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
	
}

//	Functions __________________________________________________________________

