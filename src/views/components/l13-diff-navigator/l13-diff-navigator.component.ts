//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffNavigatorViewModelService } from './l13-diff-navigator.service';
import { L13DiffNavigatorViewModel } from './l13-diff-navigator.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________

const round = Math.round;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-navigator',
	service: L13DiffNavigatorViewModelService,
	styles: [styles['l13-diff-navigator/l13-diff-navigator.css']],
	template: templates['l13-diff-navigator/l13-diff-navigator.html'],
})
export class L13DiffNavigatorComponent extends L13Element<L13DiffNavigatorViewModel> {
	
	@L13Query('#ruler')
	public canvasRuler:HTMLCanvasElement;
	
	@L13Query('#map')
	public canvasMap:HTMLCanvasElement;
	
	@L13Query('div')
	public scrollbar:HTMLDivElement;
	
	private scrollbarOffsetY:number = 0;
	
	private scrollbarMaxY:number = 0;
	
	private contextRuler:CanvasRenderingContext2D = null;
	
	private contextMap:CanvasRenderingContext2D = null;
	
	public constructor () {
		
		super();
		
		this.contextRuler = this.canvasRuler.getContext('2d');
		this.canvasRuler.width = 14;
		
		this.contextMap = this.canvasMap.getContext('2d');
		this.canvasMap.width = 30;
		
		this.scrollbar.addEventListener('mousedown', this.scrollbarDown);
		this.canvasMap.addEventListener('mousedown', this.moveScrollbar);
		
	}
	
	private moveScrollbar = (event:MouseEvent) => {
		
		const offsetY = round(this.scrollbar.offsetHeight / 2);
		
		this.setScrollbarY(event.offsetY - offsetY);
		this.scrollbarDown(event, offsetY);
		
	}
	
	private scrollbarDown = (event:MouseEvent, offsetY?:number) => {
		
		document.documentElement.classList.add('-unselectable');
		
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
		
		document.documentElement.classList.remove('-unselectable');
		
		this.dispatchCustomEvent('mouseupscroll');
		
	}
	
	private setScrollbarY (y:number) {
		
		if (y < 0) y = 0;
		else if (y > this.scrollbarMaxY) y = this.scrollbarMaxY;
		
		this.scrollbar.style.top = y + 'px';
		
		this.dispatchCustomEvent('scroll');
		
	}
	
	public clearSelection () :void {
		
		const canvas = this.canvasRuler;
		const context = this.contextRuler;
		
		context.clearRect(0, 0, canvas.height, canvas.height);
		
	}
	
	public buildSelection (items:any[], listHeight:number) :void {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const canvas = this.canvasRuler;
		const context = this.contextRuler;
		const computedStyle = getComputedStyle(document.documentElement);
		const color = computedStyle.getPropertyValue('--vscode-editorOverviewRuler-selectionHighlightForeground');
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.height = listHeight; // clears the canvas, too
		
		items.reduce((y, { offsetHeight, selected }) => {

			const h = offsetHeight / total * canvas.height;
		
			if (!selected) return y += h;
		
			const roundY = round(y);
		
			context.fillStyle = color;
			context.fillRect(5, roundY - 2, 4, 5);
		
			return y += h;
		
		}, 0);
		
	}
	
	public build (items:any[], listHeight:number) {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const canvas = this.canvasMap;
		const context = this.contextMap;
		const computedStyle = getComputedStyle(document.documentElement);
		const colors:any = {
			conflicting: computedStyle.getPropertyValue('--vscode-gitDecoration-conflictingResourceForeground'),
			deleted: computedStyle.getPropertyValue('--vscode-gitDecoration-deletedResourceForeground'),
			modified: computedStyle.getPropertyValue('--vscode-gitDecoration-modifiedResourceForeground'),
			untracked: computedStyle.getPropertyValue('--vscode-gitDecoration-untrackedResourceForeground'),
		};
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.height = listHeight; // clears the canvas, too
		
		if (total !== listHeight) {
			this.scrollbar.style.display = 'block';
			this.scrollbar.style.height = `${ round(listHeight / total * canvas.height) }px`;
			this.scrollbarMaxY = listHeight - this.scrollbar.offsetHeight;
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

