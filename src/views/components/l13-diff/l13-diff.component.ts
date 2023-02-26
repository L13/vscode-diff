//	Imports ____________________________________________________________________

import type { DiffInitMessage, DiffPanelStateMessage, DiffStatus, ListItemInfo } from '../../../types';

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import type { L13DiffActionsComponent } from '../l13-diff-actions/l13-diff-actions.component';
import type { L13DiffCompareComponent } from '../l13-diff-compare/l13-diff-compare.component';
import type { L13DiffInputComponent } from '../l13-diff-input/l13-diff-input.component';
import type { L13DiffIntroComponent } from '../l13-diff-intro/l13-diff-intro.component';
import type { L13DiffListComponent } from '../l13-diff-list/l13-diff-list.component';
import type { L13DiffMenuComponent } from '../l13-diff-menu/l13-diff-menu.component';
import type { L13DiffNavigatorComponent } from '../l13-diff-navigator/l13-diff-navigator.component';
import type { L13DiffPanelComponent } from '../l13-diff-panel/l13-diff-panel.component';
import type { L13DiffSearchComponent } from '../l13-diff-search/l13-diff-search.component';
import type { L13DiffSwapComponent } from '../l13-diff-swap/l13-diff-swap.component';

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

import { msg } from '../../common';

import styles from '../styles';
import templates from '../templates';

import * as commands from './commands';
import * as events from './events';

import { L13DiffViewModelService } from './l13-diff.service';
import type { L13DiffViewModel } from './l13-diff.viewmodel';

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
	private panel: L13DiffPanelComponent;
	
	@L13Query('#left')
	private left: L13DiffInputComponent;
	
	@L13Query('l13-diff-swap')
	private swap: L13DiffSwapComponent;
	
	@L13Query('#right')
	private right: L13DiffInputComponent;
	
	@L13Query('l13-diff-actions')
	private actions: L13DiffActionsComponent;
	
	@L13Query('l13-diff-compare')
	private compare: L13DiffCompareComponent;
	
	@L13Query('l13-diff-navigator')
	private navigator: L13DiffNavigatorComponent;
	
	@L13Query('l13-diff-list')
	private list: L13DiffListComponent;
	
	@L13Query('l13-diff-intro')
	private intro: L13DiffIntroComponent;
	
	@L13Query('l13-diff-no-result')
	private result: L13DiffIntroComponent;
	
	@L13Query('l13-diff-widgets')
	private widgets: HTMLElement;
	
	private search: L13DiffSearchComponent;
	
	private menu: L13DiffMenuComponent;
	
	public constructor () {
		
		super();
		
		this.menu = <L13DiffMenuComponent>document.createElement('l13-diff-menu');
		this.menu.vmId = 'menu';
		
		this.search = <L13DiffSearchComponent>document.createElement('l13-diff-search');
		this.search.vmId = 'search';
		
		searchVM.disable();
		
		this.initCommandsAndEvents();
		
	}
	
	private initCommandsAndEvents () {
		
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const diff = this;
		
		const actions = this.actions;
		const compare = this.compare;
		const intro = this.intro;
		const left = this.left;
		const list = this.list;
		const menu = this.menu;
		const navigator = this.navigator;
		const result = this.result;
		const right = this.right;
		const search = this.search;
		const swap = this.swap;
		const widgets = this.widgets;
		
		commands.actions.init({ list });
		commands.compare.init({ diff, left, right, search });
		commands.favorites.init({ leftVM, rightVM });
		commands.input.init({ leftVM, rightVM });
		commands.list.init({ diff, list, search });
		commands.menu.init({ menu });
		commands.search.init({ search, searchVM, widgets });
		commands.swap.init({ diff });
		commands.views.init({ viewsVM });
		
		events.actions.init({ diff, actions, list });
		events.compare.init({ diff, compare });
		events.input.init({ diff, left, menu, right });
		events.list.init({ diff, actionsVM, intro, list, listVM, navigator, result });
		events.navigator.init({ list, navigator });
		events.search.init({ diff, search, list, navigator });
		events.swap.init({ diff, swap });
		events.window.init({ diff, list, left, right, search });
		
		events.diff.init({ diff, leftVM, rightVM });
		
	}
	
	public enable () {
		
		panelVM.loading = false;
		
		if (listVM.items.length) {
			actionsVM.enable();
			if (!this.list.hasSelectedItem()) actionsVM.disableCopy();
		}
		
		compareVM.enable();
		leftVM.enable();
		listVM.enable();
		rightVM.enable();
		swapVM.enable();
		viewsVM.enable();
		
		this.list.focus();
		
	}
	
	public disable () {
		
		panelVM.loading = true;
		
		actionsVM.disable();
		compareVM.disable();
		leftVM.disable();
		listVM.disable();
		rightVM.disable();
		swapVM.disable();
		viewsVM.disable();
		
	}
	
	public swapInputs (altKey = false) {
		
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
	
	public initPanelStates (panel: DiffPanelStateMessage) {
		
		if (panel?.views) viewsVM.setState(panel.views);
		if (panel?.search) searchVM.setState(panel.search);
		
		viewsVM.on('update', () => savePanelState());
		searchVM.on('update', () => savePanelState());
		
	}
	
	public updateScrollbarPosition () {
		
		const list = this.list;
		
		this.navigator.setScrollbarPosition(list.scrollTop / list.scrollHeight);
		
	}
	
	public updateNavigator (updateMap = true, updateSelection = true) {
		
		const rowHeight = this.list.rowHeight;
			
		const values: ListItemInfo[] = this.list.filteredListItemViews.map((element) => {
			
			return {
				selected: this.list.isSelectedItem(element),
				status: <DiffStatus>element.getAttribute('data-status'),
				offsetHeight: rowHeight,
			};
			
		});
		
		const listHeight = this.list.offsetHeight;
		
		if (updateMap) {
			this.navigator.build(values, listHeight);
			this.navigator.style.top = `${this.panel.offsetHeight}px`;
			this.updateScrollbarPosition();
		}
		
		if (updateSelection) {
			this.navigator.buildSelection(values, listHeight);
		}
		
	}
	
}

//	Functions __________________________________________________________________

function savePanelState () {
	
	msg.send<DiffPanelStateMessage>('save:panelstate', {
		views: viewsVM.getState(),
		search: searchVM.getState(),
	});
	
}