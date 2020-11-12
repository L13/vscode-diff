//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffViewsViewModelService } from './l13-diff-views.service';
import { L13DiffViewsViewModel } from './l13-diff-views.viewmodel';

import { addButtonActiveStyleEvents, parseIcons, setLabel } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-views',
	service: L13DiffViewsViewModelService,
	styles: [parseIcons(styles['l13-diff-views/l13-diff-views.css'])],
	template: templates['l13-diff-views/l13-diff-views.html'],
})
export class L13DiffViewsComponent extends L13Element<L13DiffViewsViewModel> {
	
	@L13Query('#l13_show_unchanged')
	public unchanged:HTMLInputElement;
	
	@L13Query('#l13_show_deleted')
	public deleted:HTMLInputElement;
	
	@L13Query('#l13_show_modified')
	public modified:HTMLInputElement;
	
	@L13Query('#l13_show_untracked')
	public untracked:HTMLInputElement;
	
	@L13Query('#l13_show_ignored')
	public ignored:HTMLInputElement;
	
	public constructor () {
		
		super();
		
		setLabel(this.unchanged, 'Show all unchanged files');
		setLabel(this.deleted, 'Show all deleted files');
		setLabel(this.modified, 'Show all modified files');
		setLabel(this.untracked, 'Show all created files');
		setLabel(this.ignored, 'Show all ignored files');
		
		addButtonActiveStyleEvents(this.unchanged);
		addButtonActiveStyleEvents(this.deleted);
		addButtonActiveStyleEvents(this.modified);
		addButtonActiveStyleEvents(this.untracked);
		addButtonActiveStyleEvents(this.ignored);
		
	}
	
}

//	Functions __________________________________________________________________

