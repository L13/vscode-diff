//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffMapViewModelService } from './l13-diff-map.service';
import { L13DiffMapViewModel } from './l13-diff-map.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

const round = Math.round;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-map',
	service: L13DiffMapViewModelService,
	styles: [styles['l13-diff-map/l13-diff-map.css']],
	template: templates['l13-diff-map/l13-diff-map.html'],
})
export class L13DiffMapComponent extends L13Element<L13DiffMapViewModel> {
	
	@L13Query('#map')
	public canvas:HTMLCanvasElement;
	
	@L13Query('div')
	public scrollbar:HTMLDivElement;
	
	private scrollbarOffsetY:number = 0;
	
	private scrollbarMaxY:number = 0;
	
	private context:CanvasRenderingContext2D = null;
	
	public constructor () {
		
		super();
		
		this.context = this.canvas.getContext('2d');
		this.canvas.width = this.offsetWidth;
		
		this.scrollbar.addEventListener('mousedown', this.scrollbarDown);
		this.canvas.addEventListener('mousedown', this.moveScrollbar);
		
	}
	
	private moveScrollbar = (event:MouseEvent) => {
		
		const offsetY = round(this.scrollbar.offsetHeight / 2);
		
		this.setScrollbarY(event.offsetY - offsetY);
		this.scrollbarDown(event, offsetY);
		
	}
	
	private scrollbarDown = (event:MouseEvent, offsetY?:number) => {
		
		document.body.classList.add('-unselectable');
		
		this.scrollbarOffsetY = offsetY || event.offsetY;
		
		event.preventDefault();
		event.stopPropagation();
		
		document.addEventListener('mousemove', this.scrollbarMove);
		document.addEventListener('mouseup', this.scrollbarUp);
		
		this.dispatchCustomEvent('mousedownscroll');
		
	}
		
	private scrollbarMove = (event:MouseEvent) => {
		
		if (!event.which) return this.scrollbarUp();
		
		this.setScrollbarY(event.clientY - this.scrollbarOffsetY - this.offsetTop);
		
	}
		
	private scrollbarUp = () => {
		
		document.removeEventListener('mousemove', this.scrollbarMove);
		document.removeEventListener('mouseup', this.scrollbarUp);
		
		document.body.classList.remove('-unselectable');
		
		this.dispatchCustomEvent('mouseupscroll');
		
	}
	
	private setScrollbarY (y:number) {
		
		if (y < 0) y = 0;
		else if (y > this.scrollbarMaxY) y = this.scrollbarMaxY;
		
		this.scrollbar.style.top = y + 'px';
		
		this.dispatchCustomEvent('scroll');
		
	}
	
	public buildMap (items:any[], listHeight:number) {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const canvas = this.canvas;
		const context = this.context;
		const computedStyle = getComputedStyle(document.documentElement);
		const colors:any = {
			conflicting: computedStyle.getPropertyValue('--vscode-gitDecoration-conflictingResourceForeground'),
			deleted: computedStyle.getPropertyValue('--vscode-gitDecoration-deletedResourceForeground'),
			modified: computedStyle.getPropertyValue('--vscode-gitDecoration-modifiedResourceForeground'),
			untracked: computedStyle.getPropertyValue('--vscode-gitDecoration-untrackedResourceForeground'),
		};
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.height = listHeight;
		
		if (total !== listHeight) {
			this.scrollbar.style.display = 'block';
			this.scrollbar.style.height = `${ round(listHeight / total * canvas.height) }px`;
			this.scrollbarMaxY = this.offsetHeight - this.scrollbar.offsetHeight;
		} else this.scrollbar.style.display = 'none';
		
		items.reduce((y, { status, offsetHeight }) => {

			const h = offsetHeight / total * canvas.height;
			const color = colors[status];
		
			if (!color) return y += h;
		
			const roundY = round(y);
			let x = 0;
			let width = canvas.width;
		
			if (status === 'deleted') width /= 2;
			else if (status === 'untracked') x = width /= 2;
		
			context.fillStyle = color;
			context.fillRect(x, roundY, width, round(y + h) - roundY || 1);
		
			return y += h;
		
		}, 0);
		
	}
	
}

//	Functions __________________________________________________________________

