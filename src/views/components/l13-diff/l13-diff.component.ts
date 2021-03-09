//	Imports ____________________________________________________________________

import { DiffInitMessage, DiffPanelStateMessage, DiffStatus, ListItemInfo } from '../../../types';

import { L13Component, L13Element, L13Query } from '../../@l13/core';

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

import * as commands from '../../commands';
import { msg } from '../../common';
import * as events from '../../events';

import styles from '../styles';
import templates from '../templates';

import { L13DiffViewModelService } from './l13-diff.service';
import { L13DiffViewModel } from './l13-diff.viewmodel';

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

const { round } = Math;

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
		
		const menuComponent = <L13DiffMenuComponent>document.createElement('l13-diff-menu');
		menuComponent.vmId = 'menu';
		
		const searchComponent = <L13DiffSearchComponent>document.createElement('l13-diff-search');
		searchComponent.vmId = 'search';
		
		searchVM.disable();
		
		commands.actions.init(this.list);
		commands.compare.init(this, this.left, this.right, searchComponent);
		commands.favorites.init(leftVM, rightVM);
		commands.input.init(leftVM, rightVM);
		commands.list.init(this, this.list, searchComponent);
		commands.menu.init(menuComponent);
		commands.search.init(searchComponent, searchVM, this.list, this.widgets);
		commands.swap.init(this);
		commands.views.init(viewsVM);
		
		events.actions.init(this, this.actions, this.list);
		events.compare.init(this, this.compare);
		events.input.init(this, this.left, this.right, menuComponent);
		events.list.init(this, this.list, listVM, this.left, this.right, searchComponent, this.navigator, actionsVM, this.result, this.intro);
		events.navigator.init(this, this.navigator, this.list);
		events.search.init(this, searchComponent, this.list, this.navigator);
		events.swap.init(this, this.swap);
		
		events.diff.init(this, leftVM, rightVM);
		
	}
	
	public enable () :void {
		
		panelVM.loading = false;
	
		if (listVM.items.length) {
			actionsVM.enable();
			if (!this.list.content.querySelector('.-selected')) actionsVM.disableCopy();
		}
		
		compareVM.enable();
		leftVM.enable();
		listVM.enable();
		rightVM.enable();
		swapVM.enable();
		viewsVM.enable();
		
		this.list.focus();
		
	}
	
	public disable () :void {
		
		panelVM.loading = true;
		
		actionsVM.disable();
		compareVM.disable();
		leftVM.disable();
		listVM.disable();
		rightVM.disable();
		swapVM.disable();
		viewsVM.disable();
		
	}
	
	public swapInputs (altKey:boolean = false) :void {
		
		if (altKey) {
			if (listVM.items.length) {
				listVM.swapList();
				leftVM.value = listVM.diffResult.pathA;
				rightVM.value = listVM.diffResult.pathB;
			}
		} else {
			const value = leftVM.value;
			
			leftVM.value = rightVM.value;
			rightVM.value = value;
		}
		
	}
	
	public initCompare () {
		
		this.disable();
		
		listVM.items = [];
		listVM.requestUpdate();
		
		msg.send<DiffInitMessage>('create:diffs', {
			pathA: leftVM.value,
			pathB: rightVM.value,
		});
		
	}
	
	public initPanelStates (panel:DiffPanelStateMessage) {
		
		if (panel?.views) viewsVM.setState(panel.views);
		if (panel?.search) searchVM.setState(panel.search);
		
		viewsVM.on('update', () => savePanelState());
		searchVM.on('update', () => savePanelState());
		
	}
	
	public setScrollbarPosition () {
		
		const list = this.list;
		const navigator = this.navigator;
		
		navigator.scrollbar.style.top = `${round(list.scrollTop / list.scrollHeight * navigator.canvasMap.offsetHeight)}px`;
		
	}
	
	public updateNavigator (updateMap:boolean = true, updateSelection:boolean = true) {
			
		let element:HTMLElement = <HTMLElement>this.list.content.firstElementChild;
		const values:ListItemInfo[] = [];
		
		while (element) {
			values.push({
				selected: element.classList.contains('-selected'),
				status: <DiffStatus>element.getAttribute('data-status'),
				offsetHeight: element.offsetHeight,
			});
			element = <HTMLElement>element.nextElementSibling;
		}
		
		const listHeight = this.list.offsetHeight;
		
		if (updateMap) {
			this.navigator.build(values, listHeight);
			this.navigator.style.top = this.panel.offsetHeight + 'px';
			this.setScrollbarPosition();
		}
		
		if (updateSelection) {
			this.navigator.buildSelection(values, listHeight);
		}
		
	}
	
}

//	Functions __________________________________________________________________

function savePanelState () :void {
		
	msg.send<DiffPanelStateMessage>('save:panelstate', {
		views: viewsVM.getState(),
		search: searchVM.getState(),
	});
	
}