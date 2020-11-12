//	Imports ____________________________________________________________________

import { L13DiffListComponent } from '../../l13-diff-list/l13-diff-list.component';
import { L13DiffNavigatorComponent } from '../../l13-diff-navigator/l13-diff-navigator.component';
import { L13DiffComponent } from '../l13-diff.component';

//	Variables __________________________________________________________________

const { round } = Math;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (diff:L13DiffComponent, navigator:L13DiffNavigatorComponent, list:L13DiffListComponent) {
	
	navigator.addEventListener('scroll', () => {
		
		list.scrollTop = round(navigator.scrollbar.offsetTop / navigator.canvasMap.offsetHeight * list.scrollHeight);
		
	});
	
	navigator.addEventListener('mousedownscroll', () => list.classList.add('-active'));
	navigator.addEventListener('mouseupscroll', () => list.classList.remove('-active'));
	
	window.addEventListener('theme', () => {
		
		diff.updateNavigator();
		diff.updateSelection();
		
	});
	
	window.addEventListener('resize', () => {
		
		diff.updateNavigator();
		diff.updateSelection();
		
	});
	
}

//	Functions __________________________________________________________________

