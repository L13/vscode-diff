//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query, setLabel } from '../../@l13/core';

import { L13DiffActionsViewModelService } from './l13-diff-actions.service';
import { L13DiffActionsViewModel } from './l13-diff-actions.viewmodel';

import { parseIcons } from '../common';
import styles from '../styles';
import templates from '../templates';

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
	public copyRight:HTMLElement;
	
	@L13Query('#l13_select_deleted')
	public selectDeleted:HTMLElement;
	
	@L13Query('#l13_select_modified')
	public selectModified:HTMLElement;
	
	@L13Query('#l13_select_untracked')
	public selectUntracked:HTMLElement;
	
	@L13Query('#l13_select_all')
	public selectAll:HTMLElement;
	
	@L13Query('#l13_copy_left')
	public copyLeft:HTMLElement;
	
	public constructor () {
		
		super();
		
		setLabel(this.copyRight, 'Copy selection to the left folder');
		setLabel(this.selectDeleted, 'Select all deleted files');
		setLabel(this.selectModified, 'Select all modfied files');
		setLabel(this.selectUntracked, 'Select all created files');
		setLabel(this.selectAll, 'Select all files', { key: 'Ctrl+A', mac: 'Cmd+A' });
		setLabel(this.copyLeft, 'Copy selection to the right folder');
		
		this.copyRight.addEventListener('click', () => {
			
			this.dispatchCustomEvent('copy', { from: 'right' });
			
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
		
		this.copyLeft.addEventListener('click', () => {
			
			this.dispatchCustomEvent('copy', { from: 'left' });
			
		});
		
	}
	
}

//	Functions __________________________________________________________________

