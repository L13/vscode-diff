//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffListComponent } from '../l13-diff-list/l13-diff-list.component';
import { L13DiffActionsViewModelService } from './l13-diff-actions.service';
import { L13DiffActionsViewModel } from './l13-diff-actions.viewmodel';

import { isMetaKey, parseIcons, setLabelText } from '../common';
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
	
	public list:L13DiffListComponent;
	
	public constructor () {
		
		super();
		
		setLabelText(this.copyRight, 'Copy selection to the left folder');
		setLabelText(this.selectDeleted, 'Select all deleted files');
		setLabelText(this.selectModified, 'Select all modfied files');
		setLabelText(this.selectUntracked, 'Select all untracked files');
		setLabelText(this.selectAll, 'Select all files', { key: 'Ctrl+A', mac: 'Cmd+A' });
		setLabelText(this.copyLeft, 'Copy selection to the right folder');
		
		this.selectDeleted.addEventListener('click', ({ metaKey, ctrlKey }) => this.list.selectByStatus('deleted', isMetaKey(ctrlKey, metaKey)));
		this.selectModified.addEventListener('click', ({ metaKey, ctrlKey }) => this.list.selectByStatus('modified', isMetaKey(ctrlKey, metaKey)));
		this.selectUntracked.addEventListener('click', ({ metaKey, ctrlKey }) => this.list.selectByStatus('untracked', isMetaKey(ctrlKey, metaKey)));
		this.selectAll.addEventListener('click', () => this.list.selectAll());
		
		this.copyLeft.addEventListener('click', () => this.list.copy('left'));
		this.copyRight.addEventListener('click', () => this.list.copy('right'));
		
	}
	
}

//	Functions __________________________________________________________________

