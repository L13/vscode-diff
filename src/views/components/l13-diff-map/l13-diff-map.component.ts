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
	
	private context:CanvasRenderingContext2D = null;
	
	public constructor () {
		
		super();
		
		this.context = this.canvas.getContext('2d');
		this.canvas.width = 10;
		
	}
	
	public buildMap (items:any[], listHeight:number) {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const canvas = this.canvas;
		const context = this.context;
		const computedStyle = getComputedStyle(document.documentElement);
		const colors = {
			conflicting: computedStyle.getPropertyValue('--vscode-gitDecoration-conflictingResourceForeground'),
			deleted: computedStyle.getPropertyValue('--vscode-gitDecoration-deletedResourceForeground'),
			modified: computedStyle.getPropertyValue('--vscode-gitDecoration-modifiedResourceForeground'),
			unchanged: computedStyle.getPropertyValue('--vscode-foreground'),
			untracked: computedStyle.getPropertyValue('--vscode-gitDecoration-untrackedResourceForeground'),
		};
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.height = listHeight;
		
		items.reduce((y, { status, offsetHeight }) => {
			
			const h = offsetHeight / total * canvas.height;
			const roundY = round(y);
			let x = 0;
			let width = canvas.width;
			
			if (status === 'deleted') width /= 2;
			else if (status === 'untracked') x = width /= 2;
			
			context.fillStyle = (<any>colors)[status];
			context.fillRect(x, roundY, width, round(y + h) - roundY);
			
			return y += h;
			
		}, 0);
		
	}
	
}

//	Functions __________________________________________________________________

