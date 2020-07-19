//	Imports ____________________________________________________________________

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
	
	private [COMPONENTS]:L13Element<ViewModel>[] = [];
	
	private [VM_ID]:string|L13Element<ViewModel>;
	
	public get vmId () {
		
		return this[VM_ID];
		
	}
	
	public set vmId (value) {
		
		this[VM_ID] = value;
		
	}
	
	public connect (component:L13Element<ViewModel>) {
		
		const components = this[COMPONENTS];
		
		if (!components.includes(component)) components.push(component);
		
	}
	
	public dispose (component:L13Element<ViewModel>) {
		
		remove(this[COMPONENTS], component);
		
	}
	
	public requestUpdate () {
		
		let promise = refreshComponents.get(this);
		
		if (!promise) {
			promise = new Promise((resolve) => {
				
				requestAnimationFrame(() => {
					
					this[COMPONENTS].forEach((component) => component.update());
					
					refreshComponents.delete(this);
					
					this.dispatchEvent('update');
					
					resolve();
					
				});
				
			});
			refreshComponents.set(this, promise);
		}
		
		return promise;
		
	}
	
}

//	Functions __________________________________________________________________

