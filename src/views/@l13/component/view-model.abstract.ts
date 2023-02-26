//	Imports ____________________________________________________________________

import type { Dictionary } from '../../../types';

import { remove } from '../../../@l13/arrays';

import { EventDispatcher } from '../events/event-dispatcher.class';

import { L13Element } from './component.abstract';

//	Variables __________________________________________________________________

const COMPONENTS = Symbol.for('components');
const VM_ID = Symbol.for('vmId');

const refreshComponents = new Map();

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export abstract class ViewModel extends EventDispatcher {
	
	private [COMPONENTS]: Array<L13Element<ViewModel>> = [];
	
	private [VM_ID]: string;
	
	public get id () {
		
		return this[VM_ID];
		
	}
	
	public set id (value) {
		
		this[VM_ID] = value;
		
	}
	
	public connect (component: L13Element<ViewModel>) {
		
		const components = this[COMPONENTS];
		
		if (!components.includes(component)) components.push(component);
		
	}
	
	public dispose (component: L13Element<ViewModel>) {
		
		remove(this[COMPONENTS], component);
		
	}
	
	public requestUpdate (args?: Dictionary) {
		
		let request: [Promise<undefined>, Dictionary?] = refreshComponents.get(this);
		
		if (!request) {
			request = [new Promise((resolve) => {
				
				requestAnimationFrame(() => {
					
					const params = refreshComponents.get(this)[1];
					
					this[COMPONENTS].forEach(params ? (component) => component.update(params) : (component) => component.update());
					
					refreshComponents.delete(this);
					
					this.dispatchEvent('update');
					
					resolve(undefined);
					
				});
				
			})];
			if (args) request.push({ ...args });
			refreshComponents.set(this, request);
		} else if (args) {
			const params = request[1];
			request[1] = params ? { ...params, ...args } : { ...args };
		}
		
		return request[0];
		
	}
	
}

//	Functions __________________________________________________________________

