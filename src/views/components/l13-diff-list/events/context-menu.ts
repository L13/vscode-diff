//	Imports ____________________________________________________________________

import type { ContextEventsInit } from '../../../../types';

import { msg } from '../../../common';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ context, list }:ContextEventsInit) {
	
	context.addEventListener('click', (event) => event.stopImmediatePropagation());
	context.addEventListener('dblclick', (event) => event.stopImmediatePropagation());
	
	context.addEventListener('copy', ({ target, detail }:any) => {
		
		if (list.disabled) return;
		
		const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
		const rowNode = (<HTMLElement>target).closest('l13-diff-list-row');
		const isSelected = rowNode.classList.contains('-selected');
		const selections = list.getIdsBySelection();
		const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
		
		if (!isSelected) list.currentSelections = selections;
		
		list.dispatchCustomEvent('copy');
		
		if (detail.altKey) list.viewmodel.multiCopy(ids, fileNode.nextElementSibling ? 'left' : 'right');
		else list.viewmodel.copy(ids, fileNode.nextElementSibling ? 'left' : 'right');
		
	});
	
	context.addEventListener('goto', ({ target, detail }:any) => {
		
		if (list.disabled) return;
		
		const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
		const rowNode = (<HTMLElement>target).closest('l13-diff-list-row');
		const isSelected = rowNode.classList.contains('-selected');
		const selections = list.getIdsBySelection();
		const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
		
		if (!isSelected) list.currentSelections = selections;
		
		// this.dispatchCustomEvent('goto');
		list.viewmodel.goto(ids, fileNode.nextElementSibling ? 'left' : 'right', detail.altKey);
		
	});
	
	context.addEventListener('reveal', ({ target }) => {
		
		if (list.disabled) return;
		
		const pathname = (<HTMLElement>target).closest('l13-diff-list-file').getAttribute('data-fs-path');
		
		msg.send<string>('reveal:file', pathname);
		
	});
	
	context.addEventListener('delete', ({ target }) => {
		
		if (list.disabled) return;
		
		const fileNode = (<HTMLElement>target).closest('l13-diff-list-file');
		const rowNode = (<HTMLElement>target).closest('l13-diff-list-row');
		const isSelected = rowNode.classList.contains('-selected');
		const selections = list.getIdsBySelection();
		const ids = isSelected ? selections : [rowNode.getAttribute('data-id')];
		
		if (!isSelected) list.currentSelections = selections;
		
		list.dispatchCustomEvent('delete');
		list.viewmodel.delete(ids, isSelected ? 'files' : fileNode.nextElementSibling ? 'left' : 'right');
		
	});
	
	list.content.addEventListener('mouseover', ({ target }) => {
		
		if (<HTMLElement>target === context) return;
		
		const element:HTMLElement = (<HTMLElement>target).closest('l13-diff-list-file');
		
		if (element) {
			const contextParentNode = context.parentNode;
			if (element.childNodes.length) {
				if (contextParentNode !== element) {
					if (contextParentNode) context.remove();
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
				}
			} else if (contextParentNode) context.remove();
		}
		
	});
	
	list.content.addEventListener('mouseleave', () => {
		
		context.remove();
		
	});
	
}

//	Functions __________________________________________________________________

