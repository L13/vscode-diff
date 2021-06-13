//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { addButtonActiveStyleEvents, disableContextMenu, parseIcons, setLabel } from '../../common';

import styles from '../styles';
import templates from '../templates';

import { L13DiffViewsViewModelService } from './l13-diff-views.service';
import type { L13DiffViewsViewModel } from './l13-diff-views.viewmodel';

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
		
		setLabel(this.unchanged, 'Show All Unchanged Files');
		setLabel(this.deleted, 'Show All Deleted Files');
		setLabel(this.modified, 'Show All Modified Files');
		setLabel(this.untracked, 'Show All Created Files');
		setLabel(this.ignored, 'Show All Ignored Files');
		
		addButtonActiveStyleEvents(this.unchanged);
		addButtonActiveStyleEvents(this.deleted);
		addButtonActiveStyleEvents(this.modified);
		addButtonActiveStyleEvents(this.untracked);
		addButtonActiveStyleEvents(this.ignored);
		
		disableContextMenu(this);
		
	}
	
}

//	Functions __________________________________________________________________

