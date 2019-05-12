//	Imports ____________________________________________________________________

import { EventDispatcher } from '../events/event-dispatcher.class';
import { L13Element } from './component.abstract';

//	Variables __________________________________________________________________

const COMPONENTS = Symbol.for('components');
const VM_ID = Symbol.for('vmId');

const refreshComponents = new Map();

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export abstract class ViewModel extends EventDispatcher {
	
	private [COMPONENTS]:Array<L13Element<ViewModel>> = [];
	
	private [VM_ID]:string|L13Element<ViewModel>;
	
	public get vmId () {
		
		return this[VM_ID];
		
	}
	
	public set vmId (value) {
		
		this[VM_ID] = value;
		
	}
	
	public connect (component:L13Element<ViewModel>) {
		
		const components = this[COMPONENTS];
		
		if (components.indexOf(component) === -1) components.push(component);
		
	}
	
	public dispose (component:L13Element<ViewModel>) {
		
		const components = this[COMPONENTS];
		const index = components.indexOf(component);
		
		if (index !== -1) components.splice(index, 1);
		
	}
	
	public requestUpdate () {
		
		const frameId = refreshComponents.get(this);
		
		if (!frameId) {
			refreshComponents.set(this, requestAnimationFrame(() => {
				
				this[COMPONENTS].forEach((component) => component.update());
				
				refreshComponents.delete(this);
				
				this.dispatchEvent('update');
				
			}));
		}
		
	}
	
}

//	Functions __________________________________________________________________

