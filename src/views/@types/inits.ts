//	Imports ____________________________________________________________________

import { L13DiffActionsComponent } from '../components/l13-diff-actions/l13-diff-actions.component';
import { L13DiffActionsViewModel } from '../components/l13-diff-actions/l13-diff-actions.viewmodel';
import { L13DiffCompareComponent } from '../components/l13-diff-compare/l13-diff-compare.component';
import { L13DiffInputComponent } from '../components/l13-diff-input/l13-diff-input.component';
import { L13DiffInputViewModel } from '../components/l13-diff-input/l13-diff-input.viewmodel';
import { L13DiffListComponent } from '../components/l13-diff-list/l13-diff-list.component';
import { L13DiffListViewModel } from '../components/l13-diff-list/l13-diff-list.viewmodel';
import { L13DiffMenuComponent } from '../components/l13-diff-menu/l13-diff-menu.component';
import { L13DiffNavigatorComponent } from '../components/l13-diff-navigator/l13-diff-navigator.component';
import { L13DiffSearchComponent } from '../components/l13-diff-search/l13-diff-search.component';
import { L13DiffSearchViewModel } from '../components/l13-diff-search/l13-diff-search.viewmodel';
import { L13DiffSwapComponent } from '../components/l13-diff-swap/l13-diff-swap.component';
import { L13DiffViewsViewModel } from '../components/l13-diff-views/l13-diff-views.viewmodel';
import { L13DiffComponent } from '../components/l13-diff/l13-diff.component';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type ActionsCommandsInit = {
	list:L13DiffListComponent,
};

export type ActionsEventsInit = {
	diff:L13DiffComponent,
	actions:L13DiffActionsComponent,
	list:L13DiffListComponent,
};

export type CompareCommandsInit = {
	diff:L13DiffComponent,
	left:L13DiffInputComponent,
	right:L13DiffInputComponent,
	search:L13DiffSearchComponent,
};

export type CompareEventsInit = {
	diff:L13DiffComponent,
	compare:L13DiffCompareComponent,
};

export type DiffEventsInit = {
	diff:L13DiffComponent,
	leftVM:L13DiffInputViewModel,
	rightVM:L13DiffInputViewModel,
};

export type FavoritesCommandsInit = {
	leftVM:L13DiffInputViewModel,
	rightVM:L13DiffInputViewModel,
};

export type InputCommandsInit = {
	leftVM:L13DiffInputViewModel,
	rightVM:L13DiffInputViewModel,
};

export type InputEventsInit = {
	diff:L13DiffComponent,
	left:L13DiffInputComponent,
	right:L13DiffInputComponent,
	menu:L13DiffMenuComponent,
};

export type ListCommandsInit = {
	diff:L13DiffComponent,
	list:L13DiffListComponent,
	search:L13DiffSearchComponent,
};

export type ListEventsInit = {
	diff:L13DiffComponent,
	list:L13DiffListComponent,
	listVM:L13DiffListViewModel,
	left:L13DiffInputComponent,
	right:L13DiffInputComponent,
	search:L13DiffSearchComponent,
	navigator:L13DiffNavigatorComponent,
	actionsVM:L13DiffActionsViewModel,
	result:HTMLElement,
	intro:HTMLElement,
};

export type MenuCommandsInit = {
	menu:L13DiffMenuComponent,
};

export type NavigatorEventsInit = {
	diff:L13DiffComponent,
	navigator:L13DiffNavigatorComponent,
	list:L13DiffListComponent,
};

export type SearchCommandsInit = {
	search:L13DiffSearchComponent,
	searchVM:L13DiffSearchViewModel,
	widgets:HTMLElement,
};

export type SearchEventsInit = {
	diff:L13DiffComponent,
	list:L13DiffListComponent,
	navigator:L13DiffNavigatorComponent,
	search:L13DiffSearchComponent,
};

export type SwapCommandsInit = {
	diff:L13DiffComponent,
};

export type SwapEventsInit = {
	diff:L13DiffComponent,
	swap:L13DiffSwapComponent,
};

export type ViewsCommandsInit = {
	viewsVM:L13DiffViewsViewModel,
};

//	Functions __________________________________________________________________

