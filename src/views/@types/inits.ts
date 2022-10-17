//	Imports ____________________________________________________________________

import type { L13DiffActionsComponent } from '../components/l13-diff-actions/l13-diff-actions.component';
import type { L13DiffActionsViewModel } from '../components/l13-diff-actions/l13-diff-actions.viewmodel';
import type { L13DiffCompareComponent } from '../components/l13-diff-compare/l13-diff-compare.component';
import type { L13DiffContextComponent } from '../components/l13-diff-context/l13-diff-context.component';
import type { L13DiffInputComponent } from '../components/l13-diff-input/l13-diff-input.component';
import type { L13DiffInputViewModel } from '../components/l13-diff-input/l13-diff-input.viewmodel';
import type { L13DiffListComponent } from '../components/l13-diff-list/l13-diff-list.component';
import type { L13DiffListViewModel } from '../components/l13-diff-list/l13-diff-list.viewmodel';
import type { L13DiffMenuComponent } from '../components/l13-diff-menu/l13-diff-menu.component';
import type { L13DiffNavigatorComponent } from '../components/l13-diff-navigator/l13-diff-navigator.component';
import type { L13DiffSearchComponent } from '../components/l13-diff-search/l13-diff-search.component';
import type { L13DiffSearchViewModel } from '../components/l13-diff-search/l13-diff-search.viewmodel';
import type { L13DiffSwapComponent } from '../components/l13-diff-swap/l13-diff-swap.component';
import type { L13DiffViewsViewModel } from '../components/l13-diff-views/l13-diff-views.viewmodel';
import type { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type ActionsCommandsInit = {
	list: L13DiffListComponent,
};

export type ActionsEventsInit = {
	diff: L13DiffComponent,
	actions: L13DiffActionsComponent,
	list: L13DiffListComponent,
};

export type CompareCommandsInit = {
	diff: L13DiffComponent,
	left: L13DiffInputComponent,
	right: L13DiffInputComponent,
	search: L13DiffSearchComponent,
};

export type CompareEventsInit = {
	diff: L13DiffComponent,
	compare: L13DiffCompareComponent,
};

export type ContextEventsInit = {
	context: L13DiffContextComponent,
	list: L13DiffListComponent,
};

export type DiffEventsInit = {
	diff: L13DiffComponent,
	leftVM: L13DiffInputViewModel,
	rightVM: L13DiffInputViewModel,
};

export type DragNDropEventsInit = {
	list: L13DiffListComponent,
};

export type FavoritesCommandsInit = {
	leftVM: L13DiffInputViewModel,
	rightVM: L13DiffInputViewModel,
};

export type InputCommandsInit = {
	leftVM: L13DiffInputViewModel,
	rightVM: L13DiffInputViewModel,
};

export type InputEventsInit = {
	diff: L13DiffComponent,
	left: L13DiffInputComponent,
	right: L13DiffInputComponent,
	menu: L13DiffMenuComponent,
};

export type ListCommandsInit = {
	diff: L13DiffComponent,
	list: L13DiffListComponent,
	search: L13DiffSearchComponent,
};

export type ListEventsInit = {
	diff: L13DiffComponent,
	list: L13DiffListComponent,
	listVM: L13DiffListViewModel,
	navigator: L13DiffNavigatorComponent,
	actionsVM: L13DiffActionsViewModel,
	result: HTMLElement,
	intro: HTMLElement,
};

export type MenuCommandsInit = {
	menu: L13DiffMenuComponent,
};

export type NavigatorEventsInit = {
	navigator: L13DiffNavigatorComponent,
	list: L13DiffListComponent,
};

export type SearchCommandsInit = {
	search: L13DiffSearchComponent,
	searchVM: L13DiffSearchViewModel,
	widgets: HTMLElement,
};

export type SearchEventsInit = {
	diff: L13DiffComponent,
	list: L13DiffListComponent,
	navigator: L13DiffNavigatorComponent,
	search: L13DiffSearchComponent,
};

export type SwapCommandsInit = {
	diff: L13DiffComponent,
};

export type SwapEventsInit = {
	diff: L13DiffComponent,
	swap: L13DiffSwapComponent,
};

export type ViewsCommandsInit = {
	viewsVM: L13DiffViewsViewModel,
};

export type WindowEventsInit = {
	diff: L13DiffComponent,
	list: L13DiffListComponent,
	left: L13DiffInputComponent,
	right: L13DiffInputComponent,
	search: L13DiffSearchComponent,
};

//	Functions __________________________________________________________________

