//	Imports ____________________________________________________________________

import type { DiffPanelSettings } from '../types';

import { msg } from './common';

//	Variables __________________________________________________________________

const l13Settings: DiffPanelSettings = (<any>window).l13Settings;

//	Initialize _________________________________________________________________

msg.on('change:settings', (settings: DiffPanelSettings) => {
	
	if (typeof settings.enablePreview === 'boolean') enablePreview = settings.enablePreview;
	
});

//	Exports ____________________________________________________________________

export let enablePreview = l13Settings.enablePreview;

//	Functions __________________________________________________________________

