//	Imports ____________________________________________________________________

import type { ListItemInfo } from '../../../types';

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { disableContextMenu } from '../../common';

import styles from '../styles';
import templates from '../templates';

import { L13DiffNavigatorViewModelService } from './l13-diff-navigator.service';
import type { L13DiffNavigatorViewModel } from './l13-diff-navigator.viewmodel';

const { round } = Math;

//	Variables __________________________________________________________________



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
	public canvasRuler: HTMLCanvasElement;
	
	@L13Query('#map')
	public canvasMap: HTMLCanvasElement;
	
	@L13Query('#slider')
	public slider: HTMLDivElement;
	
	private sliderOffsetY = 0;
	
	private sliderMaxY = 0;
	
	private previousSliderY = 0;
	
	private contextRuler: CanvasRenderingContext2D = null;
	
	private contextMap: CanvasRenderingContext2D = null;
	
	public constructor () {
		
		super();
		
		this.contextRuler = this.canvasRuler.getContext('2d');
		this.canvasRuler.width = 14;
		
		this.contextMap = this.canvasMap.getContext('2d');
		this.canvasMap.width = 30;
		
		this.slider.addEventListener('mousedown', this.scrollbarDown);
		this.canvasMap.addEventListener('mousedown', this.moveSlider);
		
		disableContextMenu(this);
		
	}
	
	private moveSlider = (event: MouseEvent) => {
		
		const offsetY = round(this.slider.offsetHeight / 2);
		
		this.calcSliderY(event.offsetY - offsetY);
		this.scrollbarDown(event, offsetY);
		
	};
	
	private scrollbarDown = (event: MouseEvent, offsetY?: number) => {
		
		document.documentElement.classList.add('-unselectable');
		
		this.sliderOffsetY = offsetY || event.offsetY;
		
		event.preventDefault();
		event.stopPropagation();
		
		document.addEventListener('mousemove', this.scrollbarMove);
		document.addEventListener('mouseup', this.scrollbarUp);
		
		this.dispatchCustomEvent('mousedownscroll');
		
	};
		
	private scrollbarMove = (event: MouseEvent) => {
		
		if (!event.which) return this.scrollbarUp();
		
		this.calcSliderY(event.clientY - this.sliderOffsetY - this.offsetTop);
		
	};
		
	private scrollbarUp = () => {
		
		document.removeEventListener('mousemove', this.scrollbarMove);
		document.removeEventListener('mouseup', this.scrollbarUp);
		
		document.documentElement.classList.remove('-unselectable');
		
		this.dispatchCustomEvent('mouseupscroll');
		
	};
	
	private calcSliderY (y: number) {
		
		if (y < 0) y = 0;
		else if (y > this.sliderMaxY) y = this.sliderMaxY;
		
		if (this.previousSliderY === y) return;
		
		this.dispatchCustomEvent('mousemovescroll', { y, height: this.slider.offsetHeight });
		
	}
	
	public setSliderY (ratio: number) {
		
		let y = round(ratio * this.canvasMap.offsetHeight);
		const maxY = this.sliderMaxY;
		
		if (y < 0) y = 0;
		else if (y > maxY) y = maxY;
		
		if (this.previousSliderY === y) return;
		
		this.previousSliderY = y;
		this.slider.style.top = `${y}px`;
		
	}
	
	public clearSelection () {
		
		const canvas = this.canvasRuler;
		const context = this.contextRuler;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
	}
	
	public buildSelection (items: ListItemInfo[], listHeight: number) {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const canvas = this.canvasRuler;
		const context = this.contextRuler;
		const computedStyle = getComputedStyle(document.documentElement);
		const color = computedStyle.getPropertyValue('--vscode-editorOverviewRuler-selectionHighlightForeground');
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.height = listHeight; // clears the canvas, too
		
		items.reduce((y: number, { offsetHeight, selected }) => {

			const h: number = offsetHeight / total * canvas.height;
		
			if (!selected) return y + h;
		
			context.fillStyle = color;
			context.fillRect(5, round(y + h / 2) - 2, 4, 5);
		
			return y + h;
		
		}, 0);
		
	}
	
	public build (items: ListItemInfo[], listHeight: number) {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const canvas = this.canvasMap;
		const context = this.contextMap;
		const computedStyle = getComputedStyle(document.documentElement);
		const colors: any = {
			conflicting: computedStyle.getPropertyValue('--vscode-gitDecoration-conflictingResourceForeground'),
			deleted: computedStyle.getPropertyValue('--vscode-gitDecoration-deletedResourceForeground'),
			modified: computedStyle.getPropertyValue('--vscode-gitDecoration-modifiedResourceForeground'),
			untracked: computedStyle.getPropertyValue('--vscode-gitDecoration-untrackedResourceForeground'),
		};
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.height = listHeight; // clears the canvas, too
		
		if (total !== listHeight) {
			this.slider.style.display = 'block';
			this.slider.style.height = `${round(listHeight / total * canvas.height)}px`;
			this.sliderMaxY = listHeight - this.slider.offsetHeight;
		} else this.slider.style.display = 'none';
		
		items.reduce((y: number, { status, offsetHeight }) => {
			
			const h: number = offsetHeight / total * canvas.height;
			const color = colors[status];
			
			if (!color) return y + h;
			
			const roundY = round(y);
			let x = 0;
			let width = canvas.width;
			
			if (status === 'deleted') width /= 2;
			else if (status === 'untracked') x = width /= 2;
			
			context.fillStyle = color;
			context.fillRect(x, roundY, width, round(y + h) - roundY || 1);
			
			return y + h;
			
		}, 0);
		
	}
	
}

//	Functions __________________________________________________________________

