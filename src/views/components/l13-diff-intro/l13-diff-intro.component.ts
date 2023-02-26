//	Imports ____________________________________________________________________

import type { DisplayShortcut, Keybinding } from '../../../types';

import { isMacOs, isWindows, L13Component, L13Element, L13Query } from '../../@l13/core';

import { disableContextMenu, parseIcons } from '../../common';

import styles from '../styles';
import templates from '../templates';

import { L13DiffIntroViewModelService } from './l13-diff-intro.service';
import type { L13DiffIntroViewModel } from './l13-diff-intro.viewmodel';

//	Variables __________________________________________________________________

const ALT = '⌥';
const CMD = '⌘';
const CTRL = '⌃';
const SHIFT = '⇧';

const macOSSymbols = {
	Alt: ALT,
	Cmd: CMD,
	Command: CMD,
	Control: CTRL,
	Ctrl: CTRL,
	Meta: CMD,
	Option: ALT,
	Shift: SHIFT,
};

const keyboardShortcuts: DisplayShortcut[] = [
	{
		description: 'Filter Diff Result',
		key: 'Ctrl+F',
		mac: 'Cmd+F',
	},
	{
		description: 'Delete Selected Files',
		key: 'Delete',
		mac: 'Cmd+Backspace',
	},
];

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-intro',
	service: L13DiffIntroViewModelService,
	styles: [parseIcons(styles['l13-diff-intro/l13-diff-intro.css'])],
	template: templates['l13-diff-intro/l13-diff-intro.html'],
})
export class L13DiffIntroComponent extends L13Element<L13DiffIntroViewModel> {
	
	@L13Query('l13-diff-shortcuts')
	private shortcuts: HTMLElement;
	
	public constructor () {
		
		super();
		
		this.shortcuts.appendChild(createShortcutViews(keyboardShortcuts));
		
		disableContextMenu(this);
		
	}
	
}

//	Functions __________________________________________________________________

export function detectKeybinding ({ key, mac, win }: Keybinding) {
	
	return isMacOs && mac ? mac : isWindows && win ? win : key;
	
}

export function getKeyLabel (key: string) {
	
	return isMacOs ? (<any>macOSSymbols)[key] || key : key;
	
}

function createShortcutViews (shortcuts: DisplayShortcut[]) {
	
	const fragment = document.createDocumentFragment();
	
	shortcuts.forEach((shortcut) => fragment.appendChild(createShortcutView(shortcut)));
	
	return fragment;
	
}

function createShortcutView ({ description, key, mac, win }: DisplayShortcut) {
	
	key = detectKeybinding({ key, mac, win });
	
	const dl = document.createElement('DL');
	const dt = document.createElement('DT');
	const dd = document.createElement('DD');
	const div = document.createElement('DIV');
	
	dt.textContent = description;
	div.title = key;
	div.appendChild(createShortcutKeys(key));
	dd.appendChild(div);
	
	dl.appendChild(dt);
	dl.appendChild(dd);
	
	return dl;
	
}

function createShortcutKeys (key: string): DocumentFragment {
	
	const fragment = document.createDocumentFragment();
	
	key.split('+').forEach((value) => {
		
		const span = document.createElement('SPAN');
		
		span.textContent = getKeyLabel(value);
		span.className = '-key';
		
		fragment.appendChild(span);
		
	});
	
	return fragment;
	
}