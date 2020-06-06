//	Imports ____________________________________________________________________

import { isMacOs, isWindows } from '../os/platforms';
import keycodes from './keyboard.us';

import { Keybinding, Shortcut, SimpleMap } from '../../../types';

const { fromCharCode } = String;

//	Variables __________________________________________________________________

const findKey = /([a-zA-Z]+)\+/g;

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

const keyvalues = Object.values(keycodes);

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function detectKeybinding ({ key, mac, win }:Keybinding) {
	
	return isMacOs && mac ? mac : isWindows && win ? win : key;
	
}

export function getKeyLabel (key:string) {
	
	return isMacOs ? (<any>macOSSymbols)[key] || key : key;
	
}

export function addKeyListener (element:HTMLElement|Window, { key, mac, win, title }:Keybinding, listener:(event?:Event) => void) {
	
	if (title && element instanceof HTMLElement) setLabel(element, title, { key, mac, win });
	
	registerKeybinding(element, parseKeybinding(detectKeybinding({ key, mac, win })), listener);
	
}

export function setLabel (element:HTMLElement, title:string, { key, mac, win }:Keybinding = { key: null, mac: null, win: null}) {
	
	key = detectKeybinding({ key, mac, win });
	
	if (key) title += ` (${isMacOs ? formatKeybinding(key) : key})`;
	
	element.setAttribute('aria-label', title);
	element.setAttribute('title', title);
	
}

//	Functions __________________________________________________________________

function formatKeybinding (key:string) {
	
	return key.replace(findKey, (match, value) => (<any>macOSSymbols)[value] || match);
	
}

function registerKeybinding (element:HTMLElement|Window, shortcut:Shortcut, listener:(event?:Event) => void) {
	
	element.addEventListener('keydown', (event:KeyboardEvent|Event) => {
		
		if (shortcut.key // if key does not exist, nothing happens
			&& shortcut.key === (<SimpleMap>keycodes)[code(<KeyboardEvent>event)]
			&& shortcut.altKey === (<KeyboardEvent>event).altKey
			&& shortcut.ctrlKey === (<KeyboardEvent>event).ctrlKey
			&& shortcut.metaKey === (<KeyboardEvent>event).metaKey
			&& shortcut.shiftKey === (<KeyboardEvent>event).shiftKey
		) listener.call(element, event);
		
	});
	
}

function parseKeybinding (value:string) {
	
	const shortcut:Shortcut = {
		key: '',
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		shiftKey: false,
	};
	
	value.split('+').forEach((key) => {
		
		if (key === 'Alt' || key === 'Option') shortcut.altKey = true;
		else if (key === 'Ctrl' || key === 'Control') shortcut.ctrlKey = true;
		else if (key === 'Meta' || key === 'Cmd' || key === 'Command') shortcut.metaKey = true;
		else if (key === 'Shift') shortcut.shiftKey = true;
		else if (keyvalues.includes(key)) shortcut.key = key;
		
	});
	
	return shortcut;
	
}

function code ({ code, keyCode }:KeyboardEvent) {
	
	// Fixes the issue with different keyboard layouts for A to Z.
	return keyCode >= 65 && keyCode <= 90 ? `Key${fromCharCode(keyCode)}` : code;
	
}