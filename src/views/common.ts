//	Imports ____________________________________________________________________

import type { Dictionary } from '../types';

import { detectLanguage, detectPlatform, isMacOs, Message } from './@l13/core';

import icons from './components/icons';

//	Variables __________________________________________________________________

const findStyleUrl = /url\s*\(\s*"([^"]+)"\s*\)/g;

//	Initialize _________________________________________________________________

// Fixes async dom loading bug on windows in a virtual machine?!?
window.addEventListener('load', () => {
	
	detectPlatform();
	detectLanguage();
	initThemeChangeListener();
	
	document.body.appendChild(document.createElement('l13-diff'));
	
});

clearTimeout((<any>window).l13TimeoutId);

//	Exports ____________________________________________________________________

export const vscode = acquireVsCodeApi();

export const msg = new Message(vscode);

export function isMetaKey (ctrlKey:boolean, metaKey:boolean) :boolean {
	
	return isMacOs && metaKey || !isMacOs && ctrlKey;
	
}

export function parseIcons (text:string) {
	
	return text.replace(findStyleUrl, (match:string, url:string) => {
		
		const image = (<Dictionary<string>>icons)[url];
		
		if (image) match = `url("data:image/svg+xml;base64,${btoa(image)}")`;
		
		return match;
		
	});
	
}

export function removeChildren (node:Node) {
	
	let child;
	
	while ((child = node.lastChild)) child.remove();
	
}

export function scrollElementIntoView (parent:HTMLElement, element:HTMLElement) {
	
	const offsetTop = element.offsetTop;
	const offsetHeight = parent.offsetHeight;
	const scrollTop = parent.scrollTop;
	
	if (scrollTop > offsetTop) {
		parent.scrollTop = offsetTop;
	} else if (scrollTop + offsetHeight < offsetTop + element.offsetHeight) {
		parent.scrollTop = offsetTop + element.offsetHeight - offsetHeight;
	}
	
}

export function addButtonActiveStyleEvents (element:HTMLButtonElement|HTMLInputElement) {
	
	element.addEventListener('mousedown', () => element.classList.add('-active'));
	element.addEventListener('mouseup', () => element.classList.remove('-active'));
	element.addEventListener('mouseleave', () => element.classList.remove('-active'));
	
}

export function setLabel (element:HTMLElement, title:string) {
	
	element.setAttribute('aria-label', title);
	element.setAttribute('title', title);
	
}

export function disableContextMenu (element:HTMLElement) {
	
	element.addEventListener('contextmenu', (event:MouseEvent) => {
		
		event.preventDefault();
		return false;
		
	});
	
}

//	Functions __________________________________________________________________

function initThemeChangeListener () {
	
	const observer = new MutationObserver(() => window.dispatchEvent(new CustomEvent('theme', { bubbles: false })));
	
	observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
	
}