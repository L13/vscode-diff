//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { addButtonActiveStyleEvents, disableContextMenu, parseIcons, setLabel } from '../../common';

import styles from '../styles';
import templates from '../templates';

import { L13DiffActionsViewModelService } from './l13-diff-actions.service';
import type { L13DiffActionsViewModel } from './l13-diff-actions.viewmodel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-actions',
	service: L13DiffActionsViewModelService,
	styles: [parseIcons(styles['l13-diff-actions/l13-diff-actions.css'])],
	template: templates['l13-diff-actions/l13-diff-actions.html'],
})
export class L13DiffActionsComponent extends L13Element<L13DiffActionsViewModel> {
	
	@L13Query('#l13_copy_right')
	public copyRight: HTMLButtonElement;
	
	@L13Query('#l13_select_deleted')
	public selectDeleted: HTMLButtonElement;
	
	@L13Query('#l13_select_modified')
	public selectModified: HTMLButtonElement;
	
	@L13Query('#l13_select_untracked')
	public selectUntracked: HTMLButtonElement;
	
	@L13Query('#l13_select_all')
	public selectAll: HTMLButtonElement;
	
	@L13Query('#l13_copy_left')
	public copyLeft: HTMLButtonElement;
	
	public constructor () {
		
		super();
		
		setLabel(this.copyRight, 'Copy Selection to the Left Folder');
		setLabel(this.selectDeleted, 'Select All Deleted Files');
		setLabel(this.selectModified, 'Select All Modfied Files');
		setLabel(this.selectUntracked, 'Select All Created Files');
		setLabel(this.selectAll, 'Select All Files');
		setLabel(this.copyLeft, 'Copy Selection to the Right Folder');
		
		addButtonActiveStyleEvents(this.copyRight);
		addButtonActiveStyleEvents(this.selectDeleted);
		addButtonActiveStyleEvents(this.selectModified);
		addButtonActiveStyleEvents(this.selectUntracked);
		addButtonActiveStyleEvents(this.selectAll);
		addButtonActiveStyleEvents(this.copyLeft);
		
		disableContextMenu(this);
		
		this.copyRight.addEventListener('click', ({ altKey }) => {
			
			this.dispatchCustomEvent('copy', { from: 'right', altKey });
			
		});
		
		this.selectDeleted.addEventListener('click', ({ metaKey, ctrlKey }) => {
			
			this.dispatchCustomEvent('select', { status: 'deleted', metaKey, ctrlKey });
			
		});
		
		this.selectModified.addEventListener('click', ({ metaKey, ctrlKey }) => {
			
			this.dispatchCustomEvent('select', { status: 'modified', metaKey, ctrlKey });
			
		});
		
		this.selectUntracked.addEventListener('click', ({ metaKey, ctrlKey }) => {
			
			this.dispatchCustomEvent('select', { status: 'untracked', metaKey, ctrlKey });
			
		});
		
		this.selectAll.addEventListener('click', ({ metaKey, ctrlKey }) => {
			
			this.dispatchCustomEvent('select', { metaKey, ctrlKey });
			
		});
		
		this.copyLeft.addEventListener('click', ({ altKey }) => {
			
			this.dispatchCustomEvent('copy', { from: 'left', altKey });
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

