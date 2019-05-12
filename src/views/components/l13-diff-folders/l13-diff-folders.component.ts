//	Imports ____________________________________________________________________

import { L13Component, L13Element } from '../../@l13/core';

import { L13DiffFoldersViewModelService } from './l13-diff-folders.service';
import { L13DiffFoldersViewModel } from './l13-diff-folders.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-folders',
	service: L13DiffFoldersViewModelService,
	styles: [styles['l13-diff-folders/l13-diff-folders.css']],
	template: templates['l13-diff-folders/l13-diff-folders.html'],
})
export class L13DiffActionsComponent extends L13Element<L13DiffFoldersViewModel> {
	
	
	
}

//	Functions __________________________________________________________________

