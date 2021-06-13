//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Dictionary, JSONValue, Message, MessageListener } from '../../types';

import { remove } from '../../@l13/arrays';

//	Variables __________________________________________________________________

const LISTENERS = Symbol.for('listeners');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffMessage {
	
	private [LISTENERS]:Dictionary<MessageListener[]> = Object.create(null);
	
	public constructor (private panel:vscode.WebviewPanel, disposables:vscode.Disposable[]) {
		
		panel.webview.onDidReceiveMessage((message:Message) => {
			
			const command = message.command;
			const data = message.data;
			const listeners = this[LISTENERS][command];
			
			if (listeners) listeners.forEach((listener) => listener(data));
			
		}, null, disposables);
		
	}
	
	public on (name:string, listener:MessageListener) {
		
		const listeners:EventListener[] = this[LISTENERS][name] || (this[LISTENERS][name] = []);
		
		listeners[listeners.length] = listener;
		
	}
	
	public send <T = JSONValue> (command:string, data:T = null) {
		
		this.panel.webview.postMessage({ command, data });
		
	}
	
	public removeMessageListener (name:string, listener?:MessageListener) {
		
		if (!listener) delete this[LISTENERS][name];
		
		const listeners:null|MessageListener[] = this[LISTENERS][name] || null;
		
		if (listeners) {
			remove(listeners, listener);
			if (!listeners.length) delete this[LISTENERS][name];
		}
		
	}
	
	public dispose () {
		
		const listeners = this[LISTENERS];
		
		for (const name in listeners) delete listeners[name];
		
	}
	
}

//	Functions __________________________________________________________________

