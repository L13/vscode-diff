//	Imports ____________________________________________________________________

import type { Dictionary, EventListener } from '../../../types';

import { remove } from '../../../@l13/arrays';

import { Event } from './event.class';

//	Variables __________________________________________________________________

const LISTENERS = Symbol.for('listeners');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class EventDispatcher {
	
	private [LISTENERS]: Dictionary<EventListener[]> = Object.create(null);
	
	public on (name: string, listener: EventListener) {
		
		const listeners: EventListener[] = this[LISTENERS][name] || (this[LISTENERS][name] = []);
		
		listeners[listeners.length] = listener;
		
	}
	
	public hasEvent (name: string) {
		
		return !!this[LISTENERS][name];
		
	}
	
	public hasEventListener (name: string, listener: EventListener) {
		
		const listeners: null | EventListener[] = this[LISTENERS][name] || null;
		
		if (!listeners) return false;
		
		return listeners.includes(listener);
		
	}
	
	public dispatchEvent (nameOrEvent: string | Event, ...args: any[]) {
		
		let event: null | Event = nameOrEvent instanceof Event ? nameOrEvent : null;
		const name = <string>(event ? event.type : nameOrEvent);
		let listeners: null | EventListener[] = this[LISTENERS][name] || null;
		
		if (listeners) {
		//	Copy listeners to prevent stuttering if a listener will be deleted
		//	during propagation.
			listeners = listeners.slice(0);
			const values: [Event] = [event || (event = new Event({ type: name }))];
			let i = 0;
			let listener;
			
			if (args.length) values.push(...args);
			
			while ((listener = listeners[i++])) {
				listener.apply(this, values);
				if (event.isStopped) return false;
			}
			
			return true;
		}
		
		return false;
		
	}
	
	public removeEventListener (name: string, listener: EventListener) {
		
		const listeners: null | EventListener[] = this[LISTENERS][name] || null;
		
		if (listeners) {
			remove(listeners, listener);
			if (!listeners.length) delete this[LISTENERS][name];
		}
		
	}
	
}

//	Functions __________________________________________________________________

