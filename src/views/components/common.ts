//	Imports ____________________________________________________________________

import icons from './icons';

//	Variables __________________________________________________________________

const findStyleUrl = /url\s*\(\s*"([^"]+)"\s*\)/g;

//	Initialize _________________________________________________________________

window.addEventListener('load', () => {
	
	// vscode.postMessage({
	// 	command: 'show:init',
	// });
	
});

//	Exports ____________________________________________________________________

export const vscode = acquireVsCodeApi();

export const isMacOs = !!document.body.classList.contains('platform-mac');
export const isWindows = !!document.body.classList.contains('platform-win');
export const isOtherPlatform = !!document.body.classList.contains('platform-other');

export function isMetaKey (ctrlKey:boolean, metaKey:boolean) :boolean {
	
	return isMacOs && metaKey || !isMacOs && ctrlKey;
	
}

export function parseIcons (text:string) {
	
	return text.replace(findStyleUrl, (match:string, url:string) => {
		
		const image = (<any>icons)[url];
		
		if (image) match = `url("data:image/svg+xml;base64,${btoa(image)}")`;
		
		return match;
	
	});
	
}

export function setLabelText (element:HTMLElement, labelText:string) {
	
	element.setAttribute('aria-label', labelText);
	element.setAttribute('title', labelText);
	
}

export function removeChildren (node:Node) {
	
	let child;
	
	while ((child = node.lastChild)) child.remove();
	
}

//	Functions __________________________________________________________________

