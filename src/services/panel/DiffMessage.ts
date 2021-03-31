//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/arrays';
import { Message, MessageListener } from '../../types';

//	Variables __________________________________________________________________

const LISTENERS = Symbol.for('listeners');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffMessage {
	
	private [LISTENERS]:{ [name:string]: MessageListener[] } = Object.create(null);
	
	public constructor (private panel:vscode.WebviewPanel, disposables:vscode.Disposable[]) {
		
		panel.webview.onDidReceiveMessage((message:Message) => {
			
			const command = message.command;
			const data = message.data;
			const listeners = this[LISTENERS][command];
			
			if (listeners) listeners.forEach((listener) => listener(data));
			
		}, null, disposables);
		
	}
	
	public on (name:string, listener:MessageListener) :void {
		
		const listeners:EventListener[] = this[LISTENERS][name] || (this[LISTENERS][name] = []);
		
		listeners[listeners.length] = listener;
		
	}
	
	public send <T> (command:string, data:T = null) :void {
		
		this.panel.webview.postMessage({ command, data });
		
	}
	
	public removeMessageListener (name:string, listener?:MessageListener) :void {
		
		if (!listener) delete this[LISTENERS][name];
		
		const listeners:null|MessageListener[] = this[LISTENERS][name] || null;
		
		if (listeners) {
			remove(listeners, listener);
			if (!listeners.length) delete this[LISTENERS][name];
		}
		
	}
	
	public dispose () :void {
		
		const listeners = this[LISTENERS];
		
		for (const name in listeners) delete listeners[name];
		
	}
	
}

//	Functions __________________________________________________________________

