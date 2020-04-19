//	Imports ____________________________________________________________________

import { addKeyListener, L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffViewModelService } from './l13-diff.service';
import { L13DiffViewModel } from './l13-diff.viewmodel';

import { L13DiffActionsComponent } from '../l13-diff-actions/l13-diff-actions.component';
import { L13DiffCompareComponent } from '../l13-diff-compare/l13-diff-compare.component';
import { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';
import { L13DiffIntroComponent } from '../l13-diff-intro/l13-diff-intro.component';
import { L13DiffListComponent } from '../l13-diff-list/l13-diff-list.component';
import { L13DiffMapComponent } from '../l13-diff-map/l13-diff-map.component';
import { L13DiffMenuComponent } from '../l13-diff-menu/l13-diff-menu.component';
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
	
	@L13Query('l13-diff-map')
	private map:L13DiffMapComponent;
	
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
		
		this.left.menu = menu;
		this.right.menu = menu;
			
		this.swap.addEventListener('swap', ({ detail }:any) => {
			
			if (detail.altKey) {
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
			
		});
		
		this.actions.addEventListener('select', (event) => {
			
			const { metaKey, ctrlKey, status } = (<any>event).detail;
			
			if (status) this.list.selectByStatus(status, isMetaKey(ctrlKey, metaKey));
			else this.list.selectAll();
			
		});
		
		this.actions.addEventListener('copy', (event) => {
			
			this.list.copy((<any>event).detail.from);
			
		});
		
		addKeyListener(window, { key: 'Ctrl+F', mac: 'Cmd+F' }, () => {
			
			if (!search.parentNode) {
				search.viewmodel.enable().then(() => search.focus());
				this.widgets.appendChild(search);
				this.list.classList.add('-widgets');
				search.classList.add('-movein');
			} else search.focus();
			
		});
		
		addKeyListener(this.actions, { key: 'Delete', mac: 'Cmd+Backspace' }, () => this.list.delete());
		
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
		
		msg.on('init:paths', (data) => {
			
			if (data.uris.length) {
				this.left.viewmodel.value = (data.uris[0] || 0).fsPath || '';
				this.right.viewmodel.value = (data.uris[1] || 0).fsPath || '';
			} else {
				this.left.viewmodel.value = data.workspaces[0] || '';
				this.right.viewmodel.value = data.workspaces[1] || '';
			}
			
			msg.removeMessageListener('init:paths');
			
			if (data.compare) this.initCompare();
			
		});
		
		search.addEventListener('close', () => {
			
			this.list.classList.remove('-widgets');
			search.classList.add('-moveout');
			
		});
		
		search.addEventListener('animationend', () => {
			
			if (search.classList.contains('-moveout')) {
				this.map.classList.remove('-widgets');
				search.classList.remove('-moveout');
				search.viewmodel.disable();
				search.remove();
			} else {
				this.map.classList.add('-widgets');
				search.classList.remove('-movein');
			}
			
			this.updateMap();
			
		});
		
		listVM.on('compared', () => {
			
			enable();
			this.list.focus();
			
		});
		
		listVM.on('copied', () => {
			
			enable();
			this.list.focus();
			
		});
		listVM.on('deleted', () => {
			
			enable();
			this.list.focus();
			
		});
		
		listVM.on('filtered', () => {
			
			this.result.style.display = listVM.items.length && !listVM.filteredItems.length ? 'block' : 'none';
			this.intro.style.display = listVM.items.length ? 'none' : 'block';
			
		});
		
		this.list.addEventListener('selected', () => actionsVM.enableCopy());
		this.list.addEventListener('unselected', () => actionsVM.disableCopy());
		
		this.list.addEventListener('refresh', () => this.updateMap());
		window.addEventListener('resize', () => this.updateMap());
		
		this.compare.addEventListener('compare', () => this.initCompare());
		this.left.addEventListener('compare', () => this.initCompare());
		this.right.addEventListener('compare', () => this.initCompare());
		
		document.addEventListener('mouseup', ({ target }) => {
			
			if (this.list.disabled) return;
			
			if (target === document.body || target === document.documentElement) this.list.unselect();
			
		});
		
		this.list.addEventListener('scroll', () => this.setScrollbarPosition());
		
		this.map.addEventListener('scroll', () => {
			
			const list = this.list;
			const map = this.map;
			
			list.scrollTop = round(map.scrollbar.offsetTop / map.offsetHeight * list.scrollHeight);
			
		});
		
		this.map.addEventListener('mousedownscroll', () => this.list.classList.add('-active'));
		this.map.addEventListener('mouseupscroll', () => this.list.classList.remove('-active'));
		
		msg.send('init:paths');
		
	}
	
	private setScrollbarPosition () {
		
		const list = this.list;
		const map = this.map;
		
		map.scrollbar.style.top = `${round(list.scrollTop / list.scrollHeight * map.offsetHeight)}px`;
		
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
	
	private updateMap () :void {
			
		let element:HTMLElement = <HTMLElement>this.list.list.firstElementChild;
		const values:any[] = [];
		
		while (element) {
			values.push({ status: element.getAttribute('data-status'), offsetHeight: element.offsetHeight });
			element = <HTMLElement>element.nextElementSibling;
		}
		
		this.map.buildMap(values, this.list.offsetHeight);
		this.map.style.top = this.panel.offsetHeight + 'px';
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