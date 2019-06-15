//	Imports ____________________________________________________________________

import { addKeyListener, L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffViewModelService } from './l13-diff.service';
import { L13DiffViewModel } from './l13-diff.viewmodel';

import { L13DiffActionsComponent } from '../l13-diff-actions/l13-diff-actions.component';
import { L13DiffCompareComponent } from '../l13-diff-compare/l13-diff-compare.component';
import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';
import { L13DiffIntroComponent } from '../l13-diff-intro/l13-diff-intro.component';
import { L13DiffListComponent } from '../l13-diff-list/l13-diff-list.component';
import { L13DiffMenuComponent } from '../l13-diff-menu/l13-diff-menu.component';
import { L13DiffSearchComponent } from '../l13-diff-search/l13-diff-search.component';
import { L13DiffSwapComponent } from '../l13-diff-swap/l13-diff-swap.component';

import { L13DiffListViewModelService } from '../l13-diff-list/l13-diff-list.service';
import { L13DiffSearchViewModelService } from '../l13-diff-search/l13-diff-search.service';
import { L13DiffViewsViewModelService } from '../l13-diff-views/l13-diff-views.service';

import { isMetaKey, vscode } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

const listVM = new L13DiffListViewModelService().model('list');
const viewsVM = new L13DiffViewsViewModelService().model('views');
const searchVM = new L13DiffSearchViewModelService().model('search');

//	Initialize _________________________________________________________________

listVM.addFilter(viewsVM);
listVM.addFilter(searchVM);

viewsVM.on('update', () => listVM.filter());
searchVM.on('update', () => listVM.filter());

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
	
	@L13Query('l13-diff-intro')
	private intro:L13DiffIntroComponent;
	
	@L13Query('l13-diff-widgets')
	private widgets:HTMLElement;
	
	public constructor () {
		
		super();
		
		const menu = <L13DiffMenuComponent>document.createElement('l13-diff-menu');
		menu.vmId = 'menu';
		
		const search = <L13DiffSearchComponent>document.createElement('l13-diff-search');
		search.vmId = 'search';
		
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
		
		search.addEventListener('animationend', () => {
			
			if (search.classList.contains('-moveout')) {
				search.classList.remove('-moveout');
				search.remove();
			} else search.classList.remove('-movein');
			
		});
		
		addKeyListener(window, { key: 'Ctrl+F', mac: 'Cmd+F' }, () => {
			
			if (!search.parentNode) {
				this.widgets.appendChild(search);
				this.list.classList.add('-widgets');
				search.classList.add('-movein');
			}
			search.focus();
			
		});
		
		search.addEventListener('close', () => {
			
			this.list.classList.remove('-widgets');
			search.classList.add('-moveout');
			
		});
		
		window.addEventListener('message', (event:MessageEvent) => {
			
			const message = event.data;
			
			if (message.command ===  'save:favorite') {
				vscode.postMessage({
					command: message.command,
					pathA: this.left.viewmodel.value,
					pathB: this.right.viewmodel.value,
				});
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
		
		listVM.on('compared', () => this.list.focus());
		listVM.on('copied', () => this.list.focus());
		listVM.on('filtered', () => this.intro.style.display = listVM.filteredItems.length ? 'none' : 'block');
		
		
	}
	
}

//	Functions __________________________________________________________________

