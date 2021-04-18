//	Imports ____________________________________________________________________

import type { NavigatorEventsInit } from '../../types';

//	Variables __________________________________________________________________

const { round } = Math;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, navigator, list }:NavigatorEventsInit) {
	
	navigator.addEventListener('scroll', () => {
		
		list.scrollTop = round(navigator.scrollbar.offsetTop / navigator.canvasMap.offsetHeight * list.scrollHeight);
		
	});
	
	navigator.addEventListener('mousedownscroll', () => list.classList.add('-active'));
	navigator.addEventListener('mouseupscroll', () => list.classList.remove('-active'));
	
	window.addEventListener('theme', () => diff.updateNavigator());
	window.addEventListener('resize', () => diff.updateNavigator());
	
}

//	Functions __________________________________________________________________

