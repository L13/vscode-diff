//	Imports ____________________________________________________________________

import { isMacOs, isWindows, L13Component, L13Element, L13Query, setLabel } from '../../@l13/core';

import { L13DiffContextViewModelService } from './l13-diff-context.service';
import { L13DiffContextViewModel } from './l13-diff-context.viewmodel';

import { addButtonActiveStyleEvents, parseIcons } from '../common';

import styles from '../styles';
import templates from '../templates';

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
	
	@L13Query('#open')
	public buttonOpen:HTMLButtonElement;
	
	@L13Query('#copy')
	public buttonCopy:HTMLButtonElement;
	
	@L13Query('#delete')
	public buttonDelete:HTMLButtonElement;
	
	@L13Query('#reveal')
	public buttonReveal:HTMLButtonElement;
		
	public constructor () {
	
		super();
		
		setLabel(this.buttonOpen, 'Open');
		setLabel(this.buttonCopy, 'Copy');
		setLabel(this.buttonDelete, 'Delete');
		setLabel(this.buttonReveal, isMacOs ? 'Reveal in Finder' : isWindows ? 'Reveal in Explorer' : 'Open Containing Folder');
		
		addButtonActiveStyleEvents(this.buttonOpen);
		addButtonActiveStyleEvents(this.buttonCopy);
		addButtonActiveStyleEvents(this.buttonDelete);
		addButtonActiveStyleEvents(this.buttonReveal);
		
		this.buttonOpen.addEventListener('click', ({ altKey }) => this.dispatchCustomEvent('open', { altKey }));
		this.buttonCopy.addEventListener('click', ({ altKey }) => this.dispatchCustomEvent('copy', { altKey }));
		this.buttonDelete.addEventListener('click', () => this.dispatchCustomEvent('delete'));
		this.buttonReveal.addEventListener('click', () => this.dispatchCustomEvent('reveal'));
		
	}
	
}

//	Functions __________________________________________________________________

