//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffViewModelService } from './l13-diff.service';
import { L13DiffViewModel } from './l13-diff.viewmodel';

import { L13DiffActionsComponent } from '../l13-diff-actions/l13-diff-actions.component';
import { L13DiffCompareComponent } from '../l13-diff-compare/l13-diff-compare.component';
import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';
import { L13DiffListComponent } from '../l13-diff-list/l13-diff-list.component';
import { L13DiffMenuComponent } from '../l13-diff-menu/l13-diff-menu.component';
import { L13DiffSwapComponent } from '../l13-diff-swap/l13-diff-swap.component';

import { L13DiffListViewModelService } from '../l13-diff-list/l13-diff-list.service';
import { L13DiffViewsViewModelService } from '../l13-diff-views/l13-diff-views.service';

import { vscode } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

const listService = new L13DiffListViewModelService();
const viewsService = new L13DiffViewsViewModelService();

//	Initialize _________________________________________________________________

listService.model('list').addFilter(viewsService.model('views'));
viewsService.model('views').on('update', () => listService.model('list').filter());

//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff',
	service: L13DiffViewModelService,
	styles: [styles['l13-diff/l13-diff.css']],
	template: templates['l13-diff/l13-diff.html'],
})
export class L13DiffComponent extends L13Element<L13DiffViewModel> {
	
	@L13Query('#left')
	private left:L13DiffInputComponent;
	
	@L13Query('l13-diff-swap')
	private swap:L13DiffSwapComponent;
	
	@L13Query('#right')
	private right:L13DiffInputComponent;
	
	@L13Query('l13-diff-actions')
	private actions:L13DiffActionsComponent;
	
	@L13Query('l13-diff-compare')
	private compare:L13DiffCompareComponent;
	
	@L13Query('l13-diff-list')
	private list:L13DiffListComponent;
	
	public constructor () {
		
		super();
		
		const menu = <L13DiffMenuComponent>document.createElement('l13-diff-menu');
		menu.vmId = 'menu';
		
		this.left.menu = menu;
		this.left.list = this.list;
		
		this.right.menu = menu;
		this.right.list = this.list;
			
		this.swap.left = this.left;
		this.swap.right = this.right;
		
		this.actions.list = this.list;
		this.compare.list = this.list;
		
		window.addEventListener('message', (event) => {
				
			const message = event.data;
			
			if (message.command === 'update:paths') {
				if (message.uris.length) {
					this.left.viewmodel.value = (message.uris[0] || 0).fsPath || '';
					this.right.viewmodel.value = (message.uris[1] || 0).fsPath || '';
				}
			}
			
		});
		
		let init = (event:MessageEvent) => {
				
			const message = event.data;
			
			if (message.command === 'init:paths') {
				
				if (message.uris.length) {
					this.left.viewmodel.value = (message.uris[0] || 0).fsPath || '';
					this.right.viewmodel.value = (message.uris[1] || 0).fsPath || '';
				} else {
					this.left.viewmodel.value = message.workspaces[0] || '';
					this.right.viewmodel.value = message.workspaces[1] || '';
				}
				
				window.removeEventListener('message', init);
				init = null;
			}
			
		};
		
		window.addEventListener('message', init);
		
		vscode.postMessage({
			command: 'init:paths',
		});
		
	}
	
}

//	Functions __________________________________________________________________

