//	Imports ____________________________________________________________________

import icons from './icons';

//	Variables __________________________________________________________________

const findStyleUrl = /url\s*\(\s*"([^"]+)"\s*\)/g;
const findKey = /([a-zA-Z]+)\+/g;

const keys = {
	ArrowUp: '⇧',
	// ArrowDown: '⇧',
	Ctrl: '⌃',
	Cmd: '⌘',
	Alt: '⌥',
};

type Shortcut = {
	key:string,
	mac?:string,
};

//	Initialize _________________________________________________________________

 // Fixes async dom loading bug on windows in a virtual machine?!?
window.addEventListener('load', () => {
	
	const body = document.body;
	
	isMacOs = !!body.classList.contains('platform-mac');
	isWindows = !!body.classList.contains('platform-win');
	isOtherPlatform = !!body.classList.contains('platform-other');
	
	body.appendChild(document.createElement('l13-diff'));
	
});

//	Exports ____________________________________________________________________

export const vscode = acquireVsCodeApi();

export let isMacOs = false;
export let isWindows = false;
export let isOtherPlatform = false;

// Only for testing platform features

export function changePlatform () {
	
	let platform;
	
	if (isMacOs) {
		isMacOs = false;
		isWindows = true;
		platform = 'Windows';
	} else if (isWindows) {
		isWindows = false;
		isOtherPlatform = true;
		platform = 'Linux';
	} else {
		isOtherPlatform = false;
		isMacOs = true;
		platform = 'macOS';
	}
	
// tslint:disable-next-line: no-console
	console.log(`Changed platform to '${platform}'`);
	
}

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

export function setLabelText (element:HTMLElement, labelText:string, shortcut:Shortcut = null) {
	
	if (shortcut) labelText += ` (${replaceKeyboardShortcuts(shortcut)})`;
	
	element.setAttribute('aria-label', labelText);
	element.setAttribute('title', labelText);
	
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
		parent.scrollTop = (offsetTop + element.offsetHeight) - offsetHeight;
	}
	
}

//	Functions __________________________________________________________________

function replaceKeyboardShortcuts ({ key, mac }:Shortcut) :string {
	
	return !isMacOs ? key : (mac || key).replace(findKey, (match, value) => (<any>keys)[value] || match);
	
}