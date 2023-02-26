//	Imports ____________________________________________________________________

import { isMacOs, isWindows, L13Component, L13Element, L13Query } from '../../@l13/core';

import { addButtonActiveStyleEvents, disableContextMenu, parseIcons, setLabel } from '../../common';

import styles from '../styles';
import templates from '../templates';

import { L13DiffContextViewModelService } from './l13-diff-context.service';
import type { L13DiffContextViewModel } from './l13-diff-context.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-context',
	service: L13DiffContextViewModelService,
	styles: [parseIcons(styles['l13-diff-context/l13-diff-context.css'])],
	template: templates['l13-diff-context/l13-diff-context.html'],
})
export class L13DiffContextComponent extends L13Element<L13DiffContextViewModel> {
	
	@L13Query('#copy')
	public buttonCopy: HTMLButtonElement;
	
	@L13Query('#goto')
	public buttonGoto: HTMLButtonElement;
	
	@L13Query('#reveal')
	public buttonReveal: HTMLButtonElement;
	
	@L13Query('#delete')
	public buttonDelete: HTMLButtonElement;
		
	public constructor () {
	
		super();
		
		setLabel(this.buttonCopy, 'Copy');
		setLabel(this.buttonGoto, 'Go to File');
		setLabel(this.buttonReveal, isMacOs ? 'Reveal in Finder' : isWindows ? 'Reveal in File Explorer' : 'Open Containing Folder');
		setLabel(this.buttonDelete, 'Delete');
		
		addButtonActiveStyleEvents(this.buttonCopy);
		addButtonActiveStyleEvents(this.buttonGoto);
		addButtonActiveStyleEvents(this.buttonReveal);
		addButtonActiveStyleEvents(this.buttonDelete);
		
		this.buttonCopy.addEventListener('click', ({ altKey }) => this.dispatchCustomEvent('copy', { altKey }));
		this.buttonGoto.addEventListener('click', ({ altKey }) => this.dispatchCustomEvent('goto', { altKey }));
		this.buttonReveal.addEventListener('click', () => this.dispatchCustomEvent('reveal'));
		this.buttonDelete.addEventListener('click', () => this.dispatchCustomEvent('delete'));
		
		disableContextMenu(this);
		
	}
	
}

//	Functions __________________________________________________________________

