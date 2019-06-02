//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffIntroViewModelService } from './l13-diff-intro.service';
import { L13DiffIntroViewModel } from './l13-diff-intro.viewmodel';

import { isMacOs, keysymbols, parseIcons } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

type Shortcut = {
	description:string,
	key:string,
	mac?:string,
};

const keyboardShortcuts:Shortcut[] = [
	{
		description: 'Filter Diff Result',
		key: 'Ctrl+F',
		mac: 'Cmd+F',
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
	private shortcuts:HTMLElement;
	
	public constructor () {
		
		super();
		
		this.shortcuts.appendChild(createShortcutViews(keyboardShortcuts));
		
	}
	
}

//	Functions __________________________________________________________________

function createShortcutViews (shortcuts:Shortcut[]) {
	
	const fragment = document.createDocumentFragment();
	
	shortcuts.forEach((shortcut) => fragment.appendChild(createShortcutView(shortcut)));
	
	return fragment;
	
}

function createShortcutView ({ description, key, mac }:Shortcut) {
	
	key = mac || key;
	
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

function createShortcutKeys (key:string) :DocumentFragment {
	
	const fragment = document.createDocumentFragment();
	
	key.split('+').forEach((value) => {
		
		const span = document.createElement('SPAN');
		
		span.textContent = !isMacOs ? value : (<any>keysymbols)[value] || value;
		span.className = '-key';
		
		fragment.appendChild(span);
		
	});
	
	return fragment;
	
}