//	Imports ____________________________________________________________________

import type { Platform } from '../../@types/platforms';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export const platform: Platform = detectPlatform();

export let isMacOs = platform === 'macOS';

export let isWindows = platform === 'Windows';

export let isLinux = platform === 'Linux';

export function setPlatform (value: Platform) { // Just for testing
	
	isMacOs = value === 'macOS';
	isWindows = value === 'Windows';
	isLinux = value === 'Linux';
	
}

export function restoreDefaultPlatform () { // Just for testing
	
	setPlatform(platform);
	
}

//	Functions __________________________________________________________________

function detectPlatform () {
	
	if (process.platform === 'darwin') return 'macOS';
	if (process.platform === 'win32') return 'Windows';
	
	return 'Linux';
	
}