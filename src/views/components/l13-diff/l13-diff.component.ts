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
import { L13DiffNavigatorComponent } from '../l13-diff-navigator/l13-diff-navigator.component';
import { L13DiffPanelComponent } from '../l13-diff-panel/l13-diff-panel.component';
import { L13DiffSearchComponent } from '../l13-diff-search/l13-diff-search.component';
import { L13DiffSwapComponent } from '../l13-diff-swap/l13-diff-swap.component';

import { L13DiffActionsViewModelService } from '../l13-diff-actions/l13-diff-actions.service';
import { L13DiffCompareViewModelService } from '../l13-diff-compare/l13-diff-compare.service';
import { L13DiffInputViewModelService } from '../l13-diff-input/l13-diff-input.service';
import { L13DiffListViewModelService } from '../l13-diff-list/l13-diff-list.service';
import { L13DiffPanelViewModelService } from '../l13-diff-panel/l13-diff-panel.service';
import { L13DiffSearchViewModelService } from '../l13-diff-search/l13-diff-search.service';
import { L13DiffSwapViewModelService } from '../l13-diff-swap/l13-diff-swap.service';
import { L13DiffViewsViewModelService } from '../l13-diff-views/l13-diff-views.service';

import { L13DiffSearchPipe } from '../l13-diff-search/l13-diff-search.pipe';
import { L13DiffViewsPipe } from '../l13-diff-views/l13-diff-views.pipe';

import { isMetaKey, msg } from '../common';
import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

const actionsVM = new L13DiffActionsViewModelService().model('actions');
const compareVM = new L13DiffCompareViewModelService().model('compare');
const leftVM = new L13DiffInputViewModelService().model('left');
const listVM = new L13DiffListViewModelService().model('list');
const panelVM = new L13DiffPanelViewModelService().model('panel');
const rightVM = new L13DiffInputViewModelService().model('right');
const searchVM = new L13DiffSearchViewModelService().model('search');
const swapVM = new L13DiffSwapViewModelService().model('swap');
const viewsVM = new L13DiffViewsViewModelService().model('views');

const round = Math.round;

//	Initialize _________________________________________________________________

listVM.pipe(new L13DiffViewsPipe(viewsVM))
	.pipe(new L13DiffSearchPipe(searchVM));

//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff',
	service: L13DiffViewModelService,
	styles: [styles['l13-diff/l13-diff.css']],
	template: templates['l13-diff/l13-diff.html'],
})
export class L13DiffComponent extends L13Element<L13DiffViewModel> {
	
	@L13Query('l13-diff-panel')
	private panel:L13DiffPanelComponent;
	
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
	
	@L13Query('l13-diff-navigator')
	private navigator:L13DiffNavigatorComponent;
	
	@L13Query('l13-diff-list')
	private list:L13DiffListComponent;
	
	@L13Query('l13-diff-intro')
	private intro:L13DiffIntroComponent;
	
	@L13Query('l13-diff-no-result')
	private result:L13DiffIntroComponent;
	
	@L13Query('l13-diff-widgets')
	private widgets:HTMLElement;
	
	public constructor () {
		
		super();
		
		const menu = <L13DiffMenuComponent>document.createElement('l13-diff-menu');
		menu.vmId = 'menu';
		
		const search = <L13DiffSearchComponent>document.createElement('l13-diff-search');
		search.vmId = 'search';
		
	//	input view
		
		this.left.menu = menu;
		this.right.menu = menu;
		
		this.left.addEventListener('compare', () => this.initCompare());
		this.right.addEventListener('compare', () => this.initCompare());
		
	//	compare view
		
		this.compare.addEventListener('compare', () => this.initCompare());
		
	//	swap view
			
		this.swap.addEventListener('swap', ({ detail }:any) => this.swapInputs(detail.altKey));
		
	//	actions view
		
		this.actions.addEventListener('select', (event) => {
			
			const { metaKey, ctrlKey, status } = (<any>event).detail;
			
			if (status) this.list.selectByStatus(status, isMetaKey(ctrlKey, metaKey));
			else this.list.selectAll();
			
		});
		
		this.actions.addEventListener('copy', (event) => {
			
			disable();
			this.list.copy((<any>event).detail.from);
			
		});
		
	//	views view
		
		viewsVM.on('update', () => this.savePanelState());
		
	//	search view
		
		searchVM.disable();
		
		searchVM.on('update', () => this.savePanelState());
		
		search.addEventListener('close', () => {
			
			this.list.classList.remove('-widgets');
			search.classList.add('-moveout');
			
		});
		
		search.addEventListener('animationend', () => {
			
			if (search.classList.contains('-moveout')) {
				this.navigator.classList.remove('-widgets');
				search.classList.remove('-moveout');
				search.viewmodel.disable();
				search.remove();
			} else {
				this.navigator.classList.add('-widgets');
				search.classList.remove('-movein');
			}
			
			this.updateNavigator();
			
		});
		
		addKeyListener(window, { key: 'Ctrl+F', mac: 'Cmd+F' }, () => {
			
			if (!search.parentNode) {
				search.viewmodel.enable().then(() => search.focus());
				this.widgets.appendChild(search);
				this.list.classList.add('-widgets');
				search.classList.add('-movein');
			} else search.focus();
			
		});
		
	//	list view
		
		listVM.on('compared', () => this.enable());
		listVM.on('copied', () => this.enable());
		listVM.on('deleted', () => this.enable());
		listVM.on('updated', () => this.enable());
		
		listVM.on('filtered', () => {
			
			this.result.style.display = listVM.items.length && !listVM.filteredItems.length ? 'block' : 'none';
			this.intro.style.display = listVM.items.length ? 'none' : 'block';
			
		});
		
		this.list.addEventListener('copy', () => disable());
		this.list.addEventListener('delete', () => disable());
		
		this.list.addEventListener('selected', () => actionsVM.enableCopy());
		this.list.addEventListener('unselected', () => actionsVM.disableCopy());
		
		this.list.addEventListener('scroll', () => this.setScrollbarPosition());
		
		this.list.addEventListener('refresh', () => this.updateNavigator());
		
		window.addEventListener('resize', () => this.updateNavigator());
		
		addKeyListener(this.actions, { key: 'Delete', mac: 'Cmd+Backspace' }, () => this.list.delete());
		
		document.addEventListener('mouseup', ({ target }) => {
			
			if (this.list.disabled) return;
			
			if (target === document.body || target === document.documentElement) this.list.unselect();
			
		});
		
	//	navigator view
		
		this.navigator.addEventListener('scroll', () => {
			
			const list = this.list;
			const navigator = this.navigator;
			
			list.scrollTop = round(navigator.scrollbar.offsetTop / navigator.offsetHeight * list.scrollHeight);
			
		});
		
		this.navigator.addEventListener('mousedownscroll', () => this.list.classList.add('-active'));
		this.navigator.addEventListener('mouseupscroll', () => this.list.classList.remove('-active'));
		
		document.addEventListener('theme', () => this.updateNavigator());
		
	//	messages
		
		msg.on('cancel', () => this.enable());
		
		msg.on('update:paths', (data) => {
			
			if (data.uris.length) {
				this.left.viewmodel.value = (data.uris[0] || 0).fsPath || '';
				this.right.viewmodel.value = (data.uris[1] || 0).fsPath || '';
				if (data.compare) this.initCompare();
			}
			
		});
		
		msg.on('save:favorite', () => {
			
			msg.send('save:favorite', {
				pathA: this.left.viewmodel.value,
				pathB: this.right.viewmodel.value,
			});
			
		});
		
		msg.on('init:view', (data) => {
			
			msg.removeMessageListener('init:view');
			
			if (data.panel?.views) viewsVM.setState(data.panel.views);
			if (data.panel?.search) searchVM.setState(data.panel.search);
			
			if (data.uris.length) {
				this.left.viewmodel.value = (data.uris[0] || 0).fsPath || '';
				this.right.viewmodel.value = (data.uris[1] || 0).fsPath || '';
			} else {
				this.left.viewmodel.value = data.workspaces[0] || '';
				this.right.viewmodel.value = data.workspaces[1] || '';
			}
			
			if (data.compare) this.initCompare();
			
		});
		
		msg.send('init:view');
		
	}
	
	private enable () :void {
		
		enable();
		this.list.focus();
		
	}
	
	private savePanelState () :void {
		
		msg.send('save:panelstate', {
			views: viewsVM.getState(),
			search: searchVM.getState(),
		});
		
	}
	
	private swapInputs (altKey:boolean) :void {
		
		if (altKey) {
			const viewmodel = this.list.viewmodel;
			
			if (viewmodel.items.length) {
				viewmodel.swapList();
				leftVM.value = viewmodel.diffResult.pathA;
				rightVM.value = viewmodel.diffResult.pathB;
			}
		} else {
			const value = leftVM.value;
			
			leftVM.value = rightVM.value;
			rightVM.value = value;
		}
		
	}
	
	private setScrollbarPosition () {
		
		const list = this.list;
		const navigator = this.navigator;
		
		navigator.scrollbar.style.top = `${round(list.scrollTop / list.scrollHeight * navigator.offsetHeight)}px`;
		
	}
	
	private initCompare () :void {
		
		disable();
		
		listVM.items = [];
		listVM.requestUpdate();
		
		msg.send('create:diffs', {
			pathA: leftVM.value,
			pathB: rightVM.value,
		});
		
	}
	
	private updateNavigator () :void {
			
		let element:HTMLElement = <HTMLElement>this.list.content.firstElementChild;
		const values:any[] = [];
		
		while (element) {
			values.push({ status: element.getAttribute('data-status'), offsetHeight: element.offsetHeight });
			element = <HTMLElement>element.nextElementSibling;
		}
		
		this.navigator.build(values, this.list.offsetHeight);
		this.navigator.style.top = this.panel.offsetHeight + 'px';
		this.setScrollbarPosition();
		
	}
	
}

//	Functions __________________________________________________________________

function enable () {
	
	panelVM.loading = false;
	
	actionsVM.enable();
	actionsVM.disableCopy();
	compareVM.enable();
	leftVM.enable();
	listVM.enable();
	rightVM.enable();
	swapVM.enable();
	viewsVM.enable();
	
}

function disable () {
	
	panelVM.loading = true;
		
	actionsVM.disable();
	compareVM.disable();
	leftVM.disable();
	listVM.disable();
	rightVM.disable();
	swapVM.disable();
	viewsVM.disable();
	
}