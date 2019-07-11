//	Imports ____________________________________________________________________

import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffMapViewModelService } from './l13-diff-map.service';
import { L13DiffMapViewModel } from './l13-diff-map.viewmodel';

import styles from '../styles';
import templates from '../templates';

//	Variables __________________________________________________________________



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
	
	public constructor () {
		
		super();
		
		this.canvas.width = 10;
		
	}
	
	public buildMap (items:any[], listHeight:number) {
		
		const total = items.reduce((value, { offsetHeight }) => value += offsetHeight, 0);
		const round = Math.round;
		const canvas = this.canvas;
		const context = canvas.getContext('2d');
		const computedStyle = getComputedStyle(document.documentElement);
		const colors = {
			conflicting: computedStyle.getPropertyValue('--vscode-gitDecoration-conflictingResourceForeground'),
			deleted: computedStyle.getPropertyValue('--vscode-gitDecoration-deletedResourceForeground'),
			modified: computedStyle.getPropertyValue('--vscode-gitDecoration-modifiedResourceForeground'),
			unchanged: computedStyle.getPropertyValue('--vscode-gitDecoration-unchangedResourceForeground'),
			untracked: computedStyle.getPropertyValue('--vscode-gitDecoration-untrackedResourceForeground'),
		};
		// const colors = {
		// 	conflicting: '#ff8800',
		// 	deleted: '#ff0000',
		// 	modified: '#ffff00',
		// 	unchanged: '#ffffff',
		// 	untracked: '#00ff00',
		// };
		
		canvas.height = listHeight;
		context.clearRect(0, 0, canvas.width, canvas.height);
		
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

