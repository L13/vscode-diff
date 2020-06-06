//	Imports ____________________________________________________________________

import { EventListener } from '../../../types';
import { Event } from './event.class';

const { push } = Array.prototype;

//	Variables __________________________________________________________________

const LISTENERS = Symbol.for('listeners');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class EventDispatcher {
	
	private [LISTENERS]:{ [eventName:string]: EventListener[] } = Object.create(null);
	
	public on (name:string, listener:EventListener) :void {
		
		const listeners:EventListener[] = this[LISTENERS][name] || (this[LISTENERS][name] = []);
		
		listeners[listeners.length] = listener;
		
	}
	
	public hasEvent (name:string) :boolean {
		
		return !!this[LISTENERS][name];
		
	}
	
	public hasEventListener (name:string, listener:EventListener) :boolean {
		
		const listeners:null|EventListener[] = this[LISTENERS][name] || null;
		
		if (!listeners) return false;
		
		return listeners.indexOf(listener) !== -1;
		
	}
	
	public dispatchEvent (nameOrEvent:string|Event, ...args:any[]) :boolean {
		
		let event:null|Event = nameOrEvent instanceof Event ? nameOrEvent : null;
		const name:string = '' + (event ? event.type : nameOrEvent);
		let listeners:null|EventListener[] = this[LISTENERS][name] || null;
		
		if (listeners) {
		//	Copy listeners to prevent stuttering if a listener will be deleted
		//	during propagation.
			listeners = listeners.slice(0);
			const values:[Event] = [event || (event = new Event({ type: name }))];
			let i = 0;
			let listener;
			
			if (args.length) push.apply(values, args);
			
			while ((listener = listeners[i++])) {
				listener.apply(this, values);
				if (event.isStopped) return false;
			}
			
			return true;
		}
		
		return false;
		
	}
	
	public removeEventListener (name:string, listener:EventListener) :void {
		
		const listeners:null|EventListener[] = this[LISTENERS][name] || null;
		
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index !== -1) listeners.splice(index, 1);
			if (!listeners.length) delete this[LISTENERS][name];
		}
		
	}
	
}

//	Functions __________________________________________________________________

