//	Imports ____________________________________________________________________

import type { NavigatorEventsInit } from '../../types';

//	Variables __________________________________________________________________

const { floor } = Math;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ diff, navigator, list }:NavigatorEventsInit) {
	
	navigator.addEventListener('scroll', () => {
		
		const scrollbarOffsetTop = navigator.scrollbar.offsetTop;
		const scrollbarOffsetHeight = navigator.scrollbar.offsetHeight;
		const canvasOffsetHeight = navigator.canvasMap.offsetHeight;
		const listScrollHeight = list.scrollHeight;
		
		if (scrollbarOffsetTop + scrollbarOffsetHeight === canvasOffsetHeight) {
			list.scrollTop = listScrollHeight;
		} else {
			list.scrollTop = floor(scrollbarOffsetTop / canvasOffsetHeight * listScrollHeight);
		}
		
	});
	
	navigator.addEventListener('mousedownscroll', () => list.classList.add('-active'));
	navigator.addEventListener('mouseupscroll', () => list.classList.remove('-active'));
	
	window.addEventListener('theme', () => diff.updateNavigator());
	window.addEventListener('resize', () => diff.updateNavigator());
	
}

//	Functions __________________________________________________________________

