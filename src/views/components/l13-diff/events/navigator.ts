//	Imports ____________________________________________________________________

import type { NavigatorEventsInit } from '../../../../types';

import { isMacOs } from '../../../@l13/core';

//	Variables __________________________________________________________________

const { floor } = Math;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init ({ navigator, list }: NavigatorEventsInit) {
	
	navigator.addEventListener('mousemovescroll', (event: any) => {
		
		const scrollbarY = <number>event.detail.y;
		const scrollbarHeight = <number>event.detail.height;
		const canvasHeight = navigator.canvasMap.offsetHeight;
		const listScrollHeight = list.scrollHeight;
		
		if (scrollbarY + scrollbarHeight === canvasHeight) {
			list.scrollTop = listScrollHeight;
		} else {
			list.scrollTop = floor(scrollbarY / canvasHeight * listScrollHeight);
		}
		
	});
	
	navigator.addEventListener('mousedownscroll', () => list.classList.add('-active'));
	navigator.addEventListener('mouseupscroll', () => list.classList.remove('-active'));
	
	if (isMacOs) {
		navigator.addEventListener('wheel', (event: WheelEvent) => {
			
			if (list.scrollHeight > list.clientHeight) list.scrollTop += event.deltaY;
			
		});
	}
	
}

//	Functions __________________________________________________________________

