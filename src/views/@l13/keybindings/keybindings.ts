//	Imports ____________________________________________________________________

import { isMacOs, isWindows } from '../os/platforms';

import { Keybinding } from '../../../types';

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

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function detectKeybinding ({ key, mac, win }:Keybinding) {
	
	return isMacOs && mac ? mac : isWindows && win ? win : key;
	
}

export function getKeyLabel (key:string) {
	
	return isMacOs ? (<any>macOSSymbols)[key] || key : key;
	
}

export function setLabel (element:HTMLElement, title:string) {
	
	element.setAttribute('aria-label', title);
	element.setAttribute('title', title);
	
}

//	Functions __________________________________________________________________

